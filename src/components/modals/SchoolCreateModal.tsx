// components/SchoolCreateModal.tsx
import React, { useState, useRef, ChangeEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { X, UploadCloud, MapPin, Phone, User } from "lucide-react";
import { useTranslation } from "react-i18next";

const SchoolCreateModal = ({ open, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    plan: "FREE",
    createdBy: "" // This would typically come from auth context
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('errors.invalid_format'),
          description: t('errors.logo_format'),
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: t('errors.file_too_large'),
          description: t('errors.logo_size'),
          variant: "destructive",
        });
        return;
      }
      setLogoFile(file);
    }
  };

  const handlePdfUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const pdfs = files.filter(file => file.type === 'application/pdf');

      if (pdfs.length !== files.length) {
        toast({
          title: t('errors.invalid_format'),
          description: t('errors.pdf_only'),
          variant: "destructive",
        });
      }

      // Check individual file sizes (max 10MB each)
      const validPdfs = pdfs.filter(file => file.size <= 10 * 1024 * 1024);
      if (validPdfs.length !== pdfs.length) {
        toast({
          title: t('errors.file_too_large'),
          description: t('errors.pdf_size'),
          variant: "destructive",
        });
      }

      const newPdfFiles = [...pdfFiles, ...validPdfs].slice(0, 3);
      setPdfFiles(newPdfFiles);
    }
  };

  const removePdfFile = (index: number) => {
    const updatedFiles = pdfFiles.filter((_, i) => i !== index);
    setPdfFiles(updatedFiles);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: t('errors.required_fields'),
        description: t('errors.name_email_required'),
        variant: "destructive",
      });
      return;
    }

    if (pdfFiles.length < 1) {
      toast({
        title: t('errors.required_documents'),
        description: t('errors.min_one_pdf'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const dataToSend = new FormData();

      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value) dataToSend.append(key, value);
      });

      // Append files
      if (logoFile) dataToSend.append('logo', logoFile);
      pdfFiles.forEach(file => dataToSend.append('documents', file));

      // Generate a manual boundary
      const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substr(2);
      
      const { data } = await api.post("/schools/register", dataToSend, {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        }
      });

      toast({ title: t('success.create_success') });
      if (data?.school?._id) onSuccess(data.school._id);
      onClose();
    } catch (error) {
      toast({
        title: t('errors.create_error'),
        description: error?.response?.data?.message || t('errors.generic_error'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const triggerLogoInput = () => logoInputRef.current?.click();
  const triggerPdfInput = () => pdfInputRef.current?.click();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t('create_school.title')}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column 1 */}
          <div className="space-y-4">
            {/* School Name */}
            <div>
              <Label>{t('fields.name')} *</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('placeholders.name')}
              />
            </div>

            {/* Email */}
            <div>
              <Label>{t('fields.email')} *</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('placeholders.email')}
              />
            </div>

            {/* Phone */}
            <div>
              <Label>{t('fields.phone')}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('placeholders.phone')}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            {/* Address */}
            <div>
              <Label>{t('fields.address')}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={t('placeholders.address')}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Plan Selection */}
            <div>
              <Label>{t('fields.plan')}</Label>
              <select
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="FREE">{t('plans.free')}</option>
                <option value="BASIC">{t('plans.basic')}</option>
                <option value="PRO">{t('plans.pro')}</option>
              </select>
            </div>

            {/* Logo Upload */}
            <div>
              <Label>{t('fields.logo')}</Label>
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={triggerLogoInput}
                className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition"
              >
                {logoFile ? (
                  <div className="flex items-center justify-center">
                    <img
                      src={URL.createObjectURL(logoFile)}
                      alt={t('alt_texts.logo_preview')}
                      className="h-20 object-contain"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogoFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      {t('upload.click_to_upload_logo')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t('upload.logo_requirements')}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PDF Documents Upload - Full width */}
        <div className="mt-4">
          <Label>{t('fields.documents')} (1-3 {t('fields.pdf_files')}) *</Label>
          <input
            type="file"
            ref={pdfInputRef}
            onChange={handlePdfUpload}
            accept="application/pdf"
            multiple
            className="hidden"
          />
          <div
            onClick={triggerPdfInput}
            className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition"
          >
            <UploadCloud className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {t('upload.click_to_upload_documents')}
            </p>
            <p className="text-xs text-gray-500">
              {t('upload.pdf_requirements')}
            </p>
          </div>

          {/* Display uploaded PDFs */}
          {pdfFiles.length > 0 && (
            <div className="mt-2 space-y-2">
              {pdfFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm truncate">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePdfFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {t('buttons.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || pdfFiles.length === 0}
          >
            {loading ? t('buttons.creating') : t('buttons.create_school')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolCreateModal;