// moneyExchangeWithFeeController.js

import axios from 'axios';
import express from 'express';
import Invoice from '../models/Invoice';
const router = express.Router();

const CAMPAY_API_BASE_URL = process.env.CAMPAY_API_BASE_URL;
const CAMPAY_APP_USERNAME = process.env.CAMPAY_APP_USERNAME;
const CAMPAY_APP_PASSWORD = process.env.CAMPAY_APP_PASSWORD;
const CAMPAY_TOKEN_ENDPOINT = `${CAMPAY_API_BASE_URL}/token/`;
const CAMPAY_COLLECT_ENDPOINT = `${CAMPAY_API_BASE_URL}/collect/`;
const CAMPAY_DISBURSE_ENDPOINT = `${CAMPAY_API_BASE_URL}/withdraw/`;
const CAMPAY_TRANSACTION_STATUS_ENDPOINT = (reference) => `${CAMPAY_API_BASE_URL}/transaction/${reference}/`; // Endpoint to CHECK status

async function getCampayAccessToken() {
    try {
        console.log(CAMPAY_TOKEN_ENDPOINT)
        const response = await axios.post(CAMPAY_TOKEN_ENDPOINT, {
            // Confirm with Campay docs if these should be 'username'/'password' or 'app_username'/'app_password'
            username: CAMPAY_APP_USERNAME,
            password: CAMPAY_APP_PASSWORD
        });
        return response.data.token;
    } catch (error) {
        console.error('Error fetching Campay access token:', error.response ? error.response.data : error.message);
        throw new Error('Failed to obtain Campay access token. Please check credentials and base URL.');
    }
}

async function performDisbursement(data, accessToken) {
    const { receiverPhoneNumber, grossAmount, currency, senderPhoneNumber, collectReference } = data;
    const FEE_PERCENTAGE = 0.1; // 5% fee
    const feeAmount = grossAmount * FEE_PERCENTAGE;
    const netAmount = (grossAmount - feeAmount).toFixed(0);

    const disburseReference = `DISBURSE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`--- Initiating Disburse for collectRef: ${collectReference} ---`);
    console.log(`Disbursing ${netAmount} ${currency} to ${receiverPhoneNumber}...`);

    const headers = {
        'Authorization': `Token ${accessToken}`,
        'Content-Type': 'application/json'
    };

    const disbursePayload = {
        amount: netAmount,
        currency: currency,
        to: receiverPhoneNumber,
        description: `Exchange from ${senderPhoneNumber} (Fee: ${feeAmount}) - Related to collect: ${collectReference}`,
        external_reference: disburseReference
    };

    try {
        const disburseResponse = await axios.post(CAMPAY_DISBURSE_ENDPOINT, disbursePayload, { headers });

        if (disburseResponse.data.status === 'SUCCESSFUL') {
            console.log('Disbursement successful:', disburseResponse.data);
            // Here you would typically update your database with the final status,
            // send notifications, etc.
            return {
                success: true,
                message: 'Disbursement completed successfully.',
                disburseDetails: disburseResponse.data
            };
        } else {
            console.error('Campay Disburse failed:', disburseResponse.data);
            // IMPORTANT: If disburse fails here, you have collected money but not disbursed.
            // Implement a robust reconciliation process:
            // - Log this failure prominently.
            // - Consider a refund to the sender (if Campay provides a refund API).
            // - Alert administrators for manual intervention.
            return {
                success: false,
                message: 'Disbursement failed or is pending Campay processing.',
                disburseDetails: disburseResponse.data
            };
        }
    } catch (error) {
        console.error('Error during Campay disbursement:', error.response ? error.response.data : error.message);
        return {
            success: false,
            message: 'An error occurred during disbursement API call.',
            errorDetails: error.response ? error.response.data : error.message
        };
    }
}

router.post('/collect/:invoiceId', async (req, res) => {
    const { phoneNumber, grossAmount, currency } = req.body;
    const { invoiceId } = req.params;
    if (!phoneNumber || !grossAmount || !currency) {
        return res.status(400).json({ message: 'Missing required parameters: senderPhoneNumber, receiverPhoneNumber, grossAmount, currency.' });
    }
    if (typeof grossAmount !== 'number' || grossAmount <= 0) {
        return res.status(400).json({ message: 'Gross amount must be a positive number.' });
    }
    const phoneRegex = /^237\d{9}$/; // Example for Cameroon numbers
    if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({ message: 'Invalid phone number format. Must include country code (e.g., 6xxxxxxxx).' });
    }

    let accessToken;
    try {
        accessToken = await getCampayAccessToken();
    } catch (tokenError) {
        return res.status(500).json({ message: tokenError.message });
    }

    const headers = {
        'Authorization': `Token ${accessToken}`,
        'Content-Type': 'application/json'
    };

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    // let collectReference = `${invoice._id}`;
    let collectReference = `COLLECT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
        
        console.log("--- Step 1: Initiating Collect ---");
        const collectPayload = {
            amount: grossAmount,
            currency: currency,
            from: phoneNumber,
            description: description || 'Collection for money exchange',
            external_reference: collectReference
        };

        const collectResponse = await axios.post(CAMPAY_COLLECT_ENDPOINT, collectPayload, { headers });

        if (collectResponse.status === 200 || collectResponse.status === 202) {
            console.log('Campay Collect Initiation successful:', collectResponse.data);
            invoice.externalReference= collectReference
            invoice.save();
            res.status(202).json({
                message: 'Money collection initiated. Awaiting sender confirmation and Campay processing.',
                status: collectResponse.data.status || 'PENDING', 
                collectReference: collectReference,
                details: collectResponse.data,
                receiverPhoneNumber: receiverPhoneNumber,
                nextSteps: 'Monitor transaction status using the collectReference or await webhook for completion.'
            });
        } else {
            console.error('Campay Collect Initiation failed with unexpected status:', collectResponse.data);
            return res.status(400).json({
                message: 'Failed to initiate money collection from sender.',
                details: collectResponse.data
            });
        }

    } catch (error) {
        console.error('Error during Campay collect initiation:', error.response ? error.response.data : error.message);
        let errorMessage = 'An unexpected error occurred during the collection initiation.';
        let errorDetails = {};

        if (error.response && error.response.data) {
            errorMessage = error.response.data.detail || error.response.data.message || error.response.data;
            errorDetails = error.response.data;
        }

        res.status(error.response ? error.response.status : 500).json({
            message: errorMessage,
            campayError: errorDetails,
            collectReference: collectReference 
        });
    }
});

router.post('/webhook/campay-status', async (req, res) => {
    console.log('Received Campay Webhook:', req.body);

    const transaction = req.body; // Campay's webhook payload
    const paymentReference = transaction.reference; // Assuming 'reference' is the key
    const status = transaction.status; // e.g., 'SUCCESSFUL', 'FAILED', 'PENDING'

    // You should retrieve the full transaction details from your database using paymentReference
    // to get senderPhoneNumber, receiverPhoneNumber, grossAmount, currency.
    // For this example, let's assume we have them (in a real app, this would be a DB lookup).
    const storedTransactionData = {
        senderPhoneNumber: '2376XXXXXXXXX', // Retrieve from DB based on paymentReference
        receiverPhoneNumber: '2376YYYYYYYYY', // Retrieve from DB
        grossAmount: 1000, // Retrieve from DB
        currency: 'XAF', // Retrieve from DB
        collectReference: paymentReference
    };

    if (status === 'SUCCESSFUL') {
        console.log(`Collect transaction ${paymentReference} is SUCCESSFUL. Proceeding to disburse.`);
        // Get a new access token for disbursement (or reuse if still valid)
        let accessToken;
        try {
            accessToken = await getCampayAccessToken();
        } catch (tokenError) {
            console.error('Webhook: Failed to get access token for disbursement:', tokenError.message);
            return res.status(500).send('Failed to process webhook: Token error.');
        }

        const disburseResult = await performDisbursement(storedTransactionData, accessToken);

        if (disburseResult.success) {
            // Update your database with disbursement success
            console.log(`Disbursement for ${paymentReference} completed.`);
            res.status(200).send('Webhook processed: Disbursement successful.');
        } else {
            // Update your database with disbursement failure
            console.error(`Disbursement for ${paymentReference} failed:`, disburseResult.message);
            res.status(200).send('Webhook processed: Disbursement failed (reconciliation needed).'); // Still 200 to acknowledge webhook
        }
    } else if (status === 'FAILED' || status === 'CANCELLED') {
        console.log(`Collect transaction ${paymentReference} ${status}. No disbursement needed.`);
        // Update your database to mark the transaction as failed/cancelled
        // Notify sender if necessary
        res.status(200).send('Webhook processed: Collection failed.');
    } else {
        console.log(`Collect transaction ${paymentReference} is ${status}. Waiting for final status.`);
        // Update your database with the current status
        res.status(200).send('Webhook processed: Status updated.');
    }
});

router.get('/check-collect-status/:collectReference', async (req, res) => {
    const { collectReference } = req.params;

    if (!collectReference) {
        return res.status(400).json({ message: 'Missing collectReference parameter.' });
    }
    console.log(collectReference)
    let accessToken;
    try {
        accessToken = await getCampayAccessToken();
    } catch (tokenError) {
        return res.status(500).json({ message: tokenError.message });
    }

    const headers = {
        'Authorization': `Token ${accessToken}`,
        'Content-Type': 'application/json'
    };

    try {
        const statusUrl = CAMPAY_TRANSACTION_STATUS_ENDPOINT(collectReference);
        const statusResponse = await axios.get(statusUrl, { headers });

        const transactionStatus = statusResponse.data.status;
        console.log(`Status for ${collectReference}: ${transactionStatus}`);

        // Similar logic as in the webhook. If 'SUCCESSFUL', then trigger disbursement.
        // This would typically be done by a background job, not a direct client request.
        if (transactionStatus === 'SUCCESSFUL') {
            // IMPORTANT: Retrieve sender/receiver/amount from your DB using collectReference
            // and then call performDisbursement(...)
            const storedTransactionData = {
                senderPhoneNumber: '237651558567', // Placeholder: Get from your DB
                receiverPhoneNumber: '237651558567', // Placeholder: Get from your DB
                grossAmount: 10, // Placeholder: Get from your DB
                currency: 'XAF', // Placeholder: Get from your DB
                collectReference: collectReference
            };
            const disburseResult = await performDisbursement(storedTransactionData, accessToken);
            return res.status(200).json({
                message: `Collection successful. Disbursement ${disburseResult.success ? 'initiated' : 'failed to initiate'}.`,
                collectStatus: transactionStatus,
                disburseStatus: disburseResult.disburseDetails ? disburseResult.disburseDetails.status : 'N/A',
                details: statusResponse.data
            });
        } else {
            res.status(200).json({
                message: 'Collection status checked.',
                collectStatus: transactionStatus,
                details: statusResponse.data
            });
        }

    } catch (error) {
        console.error(`Error checking status for ${collectReference}:`, error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({
            message: 'Failed to check transaction status.',
            campayError: error.response ? error.response.data : error.message
        });
    }
});

module.exports = router;