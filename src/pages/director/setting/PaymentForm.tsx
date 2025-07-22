import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, User, Info, XCircle } from "lucide-react";
import {
  AcademicFee,
  AcademicYearStudent,
} from "@/lib/services/academicService";
import { useTranslation } from "react-i18next";

interface PaymentFormProps {
  student?: any;
  initialData?: AcademicFee;
  onSubmit: (student: AcademicYearStudent, fee: AcademicFee) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  student,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [billID, setBillID] = useState(initialData?.billID || "");
  const [type, setType] = useState(initialData?.type || "");
  const [amount, setAmount] = useState(initialData?.amount || 0);
  const [paymentDate, setPaymentDate] = useState(
    initialData?.paymentDate ? initialData.paymentDate.substring(0, 10) : ""
  );
  const [paymentMethod, setPaymentMethod] = useState(
    initialData?.paymentMethod || ""
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!billID.trim()) newErrors.type = "Bill ID is required";
    if (!type.trim()) newErrors.type = "Fee type is required";
    if (amount <= 0) newErrors.amount = "Amount must be greater than zero";
    if (!paymentDate) newErrors.paymentDate = "Payment date is required";
    if (!paymentMethod.trim())
      newErrors.paymentMethod = "Payment method is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  //   console.log("student", student);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) {
      setErrors({ student: "Student information is missing." });
      return;
    }
    if (!validate()) return;

    onSubmit(student, {
      billID,
      type,
      amount,
      paymentDate,
      paymentMethod,
    });
  };

  return (
    <div>
      {/* Student info */}
      {student ? (
        <Card className="bg-gray-50 p-4 mb-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <User size={20} /> {t("paymentForm.studentInfo")}
          </h3>
          <p>
            <strong>{t("paymentForm.name")}:</strong>{" "}
            {student.studentName || t("common.na")}
          </p>
          <p>
            <strong>{t("paymentForm.class")}:</strong>{" "}
            {student.studentClass || t("common.na")}
          </p>
          <p>
            <strong>{t("paymentForm.academicYear")}:</strong>{" "}
            {student.year || t("common.na")}
          </p>
        </Card>
      ) : (
        <div className="text-red-600 flex items-center gap-2">
          <XCircle /> {t("paymentForm.studentNotAvailable")}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium" htmlFor="feeBillID">
            {t("paymentForm.feeBill")}
          </label>
          <Input
            id="feeBillID"
            placeholder={t("paymentForm.feeBillPlaceholder")}
            value={billID}
            onChange={(e) => setBillID(e.target.value)}
            aria-invalid={!!errors.billID}
            aria-describedby="feeBillID-error"
          />
          {errors.billID && (
            <p id="feeBillID-error" className="text-red-600 text-sm mt-1">
              {errors.billID}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium" htmlFor="feeType">
            {t("paymentForm.feeType")}
          </label>
          <Input
            id="feeType"
            placeholder={t("paymentForm.feeTypePlaceholder")}
            value={type}
            onChange={(e) => setType(e.target.value)}
            aria-invalid={!!errors.type}
            aria-describedby="feeType-error"
          />
          {errors.type && (
            <p id="feeType-error" className="text-red-600 text-sm mt-1">
              {errors.type}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium" htmlFor="amount">
            {t("paymentForm.amount")}
          </label>
          <Input
            id="amount"
            type="number"
            min={0}
            step={0.01}
            placeholder={t("paymentForm.amountPlaceholder")}
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            aria-invalid={!!errors.amount}
            aria-describedby="amount-error"
          />
          {errors.amount && (
            <p id="amount-error" className="text-red-600 text-sm mt-1">
              {errors.amount}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium" htmlFor="paymentDate">
            {t("paymentForm.paymentDate")}
          </label>
          <Input
            id="paymentDate"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            aria-invalid={!!errors.paymentDate}
            aria-describedby="paymentDate-error"
          />
          {errors.paymentDate && (
            <p id="paymentDate-error" className="text-red-600 text-sm mt-1">
              {errors.paymentDate}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium" htmlFor="paymentMethod">
            {t("paymentForm.paymentMethod")}
          </label>
          <Input
            id="paymentMethod"
            placeholder={t("paymentForm.paymentMethodPlaceholder")}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            aria-invalid={!!errors.paymentMethod}
            aria-describedby="paymentMethod-error"
          />
          {errors.paymentMethod && (
            <p id="paymentMethod-error" className="text-red-600 text-sm mt-1">
              {errors.paymentMethod}
            </p>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={!student}>
            {initialData ? t("paymentForm.updateFee") : t("paymentForm.addFee")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
