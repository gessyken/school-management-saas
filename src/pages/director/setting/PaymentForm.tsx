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
    if (!billID.trim()) newErrors.billID = t('school.payment_form.errors.bill_id_required');
    if (!type.trim()) newErrors.type = t('school.payment_form.errors.type_required');
    if (amount <= 0) newErrors.amount = t('school.payment_form.errors.amount_invalid');
    if (!paymentDate) newErrors.paymentDate = t('school.payment_form.errors.date_required');
    if (!paymentMethod.trim()) newErrors.paymentMethod = t('school.payment_form.errors.method_required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) {
      setErrors({ student: t('school.payment_form.errors.student_missing') });
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
        <Card className="bg-muted p-4 mb-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <User size={20} /> {t('school.payment_form.student_info')}
          </h3>
          <p>
            <strong>{t('school.payment_form.name')}:</strong> {student.studentName || t('school.payment_form.na')}
          </p>
          <p>
            <strong>{t('school.payment_form.class')}:</strong> {student.studentClass || t('school.payment_form.na')}
          </p>
          <p>
            <strong>{t('school.payment_form.academic_year')}:</strong> {student.year || t('school.payment_form.na')}
          </p>
        </Card>
      ) : (
        <div className="text-destructive flex items-center gap-2">
          <XCircle /> {t('school.payment_form.errors.student_missing')}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium" htmlFor="feeBillID">
            {t('school.payment_form.bill_id')}
          </label>
          <Input
            id="feeBillID"
            placeholder={t('school.payment_form.placeholders.bill_id')}
            value={billID}
            onChange={(e) => setBillID(e.target.value)}
            aria-invalid={!!errors.billID}
            aria-describedby="feeBillID-error"
          />
          {errors.billID && (
            <p id="feeBillID-error" className="text-destructive text-sm mt-1">
              {errors.billID}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium" htmlFor="feeType">
            {t('school.payment_form.fee_type')}
          </label>
          <Input
            id="feeType"
            placeholder={t('school.payment_form.placeholders.fee_type')}
            value={type}
            onChange={(e) => setType(e.target.value)}
            aria-invalid={!!errors.type}
            aria-describedby="feeType-error"
          />
          {errors.type && (
            <p id="feeType-error" className="text-destructive text-sm mt-1">
              {errors.type}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium" htmlFor="amount">
            {t('school.payment_form.amount')}
          </label>
          <Input
            id="amount"
            type="number"
            min={0}
            step={0.01}
            placeholder={t('school.payment_form.placeholders.amount')}
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            aria-invalid={!!errors.amount}
            aria-describedby="amount-error"
          />
          {errors.amount && (
            <p id="amount-error" className="text-destructive text-sm mt-1">
              {errors.amount}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium" htmlFor="paymentDate">
            {t('school.payment_form.payment_date')}
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
            <p id="paymentDate-error" className="text-destructive text-sm mt-1">
              {errors.paymentDate}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium" htmlFor="paymentMethod">
            {t('school.payment_form.payment_method')}
          </label>
          <Input
            id="paymentMethod"
            placeholder={t('school.payment_form.placeholders.payment_method')}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            aria-invalid={!!errors.paymentMethod}
            aria-describedby="paymentMethod-error"
          />
          {errors.paymentMethod && (
            <p id="paymentMethod-error" className="text-destructive text-sm mt-1">
              {errors.paymentMethod}
            </p>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onCancel}>
            {t('school.payment_form.cancel')}
          </Button>
          <Button type="submit" disabled={!student}>
            {initialData ? t('school.payment_form.update_button') : t('school.payment_form.add_button')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;