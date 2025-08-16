import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, FileText, Image, X } from "lucide-react";
import api, { BASE_URL } from "@/lib/api";
import { SCHOOL_KEY } from "@/lib/key";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

interface SchoolData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  description?: string;
  website?: string;
  subdomain?: string;
  logoUrl?: string;
  documents?: string[];
  plan?: 'FREE' | 'BASIC' | 'PRO';
  billing?: {
    status: "active" | "trialing" | "past_due" | "canceled" | "unpaid";
    trialEndsAt?: Date | string;
  };
  accessStatus?: 'pending_verification' | 'active' | 'suspended' | 'blocked';
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  memberShipAccessStatus?: boolean;
  blockReason?: string;
}

const EditSchoolPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SchoolData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    website: "",
    subdomain: "",
    plan: 'FREE',
    accessStatus: 'pending_verification',
    verificationStatus: 'pending',
    memberShipAccessStatus: true,
    documents: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({
    logo: false,
    document: false,
  });

  // Initialize school ID
  useEffect(() => {
    const stored = localStorage.getItem(SCHOOL_KEY);
    if (!stored) {
      navigate("/schools-select");
      return;
    }
    const schoolObj = JSON.parse(stored);
    setSchoolId(schoolObj?._id || null);
  }, [navigate]);

  // Fetch current school data
  useEffect(() => {
    if (!schoolId) return;

    const fetchSchool = async () => {
      try {
        const res = await api.get(`/schools/${schoolId}`);
        const data = {
          ...res.data,
          billing: {
            ...res.data.billing,
            trialEndsAt: res.data.billing?.trialEndsAt
              ? new Date(res.data.billing.trialEndsAt).toISOString().split('T')[0]
              : undefined
          }
        };
        setFormData(data);
      } catch {
        toast({
          title: t('school.edit_school.error.title'),
          description: t('school.edit_school.error.load_failed'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSchool();
  }, [schoolId, toast, t]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: t('school.edit_school.validation.title'),
        description: t('school.edit_school.validation.name_required'),
        variant: "destructive",
      });
      return false;
    }
    if (!formData.email.trim()) {
      toast({
        title: t('school.edit_school.validation.title'),
        description: t('school.edit_school.validation.email_required'),
        variant: "destructive",
      });
      return false;
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: t('school.edit_school.validation.title'),
        description: t('school.edit_school.validation.email_invalid'),
        variant: "destructive",
      });
      return false;
    }
    if (formData.subdomain && !/^[a-z0-9-]+$/.test(formData.subdomain)) {
      toast({
        title: t('school.edit_school.validation.title'),
        description: t('school.edit_school.validation.subdomain_invalid'),
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleChange = (field: keyof SchoolData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSelectChange = (field: keyof SchoolData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'document') => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(prev => ({ ...prev, [type]: true }));

      // Simulate upload - replace with actual API call
      const response = await new Promise<{ url: string }>((resolve) => {
        setTimeout(() => {
          resolve({ url: URL.createObjectURL(file) });
        }, 1500);
      });

      if (type === 'document') {
        setFormData(prev => ({
          ...prev,
          documents: [
            ...(prev.documents || []),
            response.url
          ]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          logoUrl: response.url
        }));
      }

      toast({
        title: t('school.edit_school.success.title'),
        description: type === 'document' 
          ? t('school.edit_school.success.document_uploaded')
          : t('school.edit_school.success.logo_uploaded'),
      });
    } catch (error) {
      toast({
        title: t('school.edit_school.error.title'),
        description: type === 'document'
          ? t('school.edit_school.error.document_upload_failed')
          : t('school.edit_school.error.logo_upload_failed'),
        variant: "destructive",
      });
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => {
      const newDocs = [...(prev.documents || [])];
      newDocs.splice(index, 1);
      return { ...prev, documents: newDocs };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !schoolId) return;

    setSaving(true);
    try {
      const sendData = new FormData();
      sendData.append('name', formData.name);
      sendData.append('email', formData.email);
      sendData.append('phone', formData.phone || '');
      sendData.append('address', formData.address || '');
      sendData.append('description', formData.description || '');
      sendData.append('website', formData.website || '');
      sendData.append('subdomain', formData.subdomain || '');
      sendData.append('plan', formData.plan || 'FREE');
      sendData.append('accessStatus', formData.accessStatus || 'pending_verification');
      sendData.append('memberShipAccessStatus', String(formData.memberShipAccessStatus));
      sendData.append('blockReason', formData.blockReason || '');

      formData.documents
        ?.filter(doc => !(typeof doc === "string" && doc.startsWith("blob:")))
        .forEach((doc, index) => {
          sendData.append(`documents[${index}]`, doc);
        });

      if (logoInputRef.current?.files?.[0]) {
        sendData.append('logo', logoInputRef.current.files[0]);
      } else if (formData.logoUrl) {
        sendData.append('logoUrl', formData.logoUrl);
      }

      if (documentInputRef.current?.files) {
        Array.from(documentInputRef.current.files).forEach(file => {
          sendData.append('documents', file);
        });
      }

      const response = await api.put(`/schools/${schoolId}`, sendData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: t('school.edit_school.success.title'),
        description: t('school.edit_school.success.school_updated'),
      });
    } catch (error) {
      toast({
        title: t('school.edit_school.error.title'),
        description: t('school.edit_school.error.update_failed'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <h2 className="text-2xl font-bold">{t('school.edit_school.title')}</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">{t('school.edit_school.name')}*</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange("name")}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">{t('school.edit_school.email')}*</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">{t('school.edit_school.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange("phone")}
              />
            </div>
            <div>
              <Label htmlFor="subdomain">{t('school.edit_school.subdomain')}</Label>
              <Input
                id="subdomain"
                type="text"
                value={formData.subdomain}
                onChange={handleChange("subdomain")}
                placeholder={t('school.edit_school.subdomain_placeholder')}
              />
            </div>
            <div>
              <Label>{t('school.edit_school.plan')}</Label>
              <Select
                value={formData.plan}
                disabled
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('school.edit_school.select_plan')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">{t('school.edit_school.plan_free')}</SelectItem>
                  <SelectItem value="BASIC">{t('school.edit_school.plan_basic')}</SelectItem>
                  <SelectItem value="PRO">{t('school.edit_school.plan_pro')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('school.edit_school.access_status')}</Label>
              <Select
                value={formData.accessStatus}
                disabled
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('school.edit_school.select_status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending_verification">{t('school.edit_school.status_pending')}</SelectItem>
                  <SelectItem value="active">{t('school.edit_school.status_active')}</SelectItem>
                  <SelectItem value="suspended">{t('school.edit_school.status_suspended')}</SelectItem>
                  <SelectItem value="blocked">{t('school.edit_school.status_blocked')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">{t('school.edit_school.address')}</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={handleChange("address")}
            />
          </div>

          {/* Block Reason */}
          {formData.blockReason && (
            <div>
              <Label htmlFor="blockReason">{t('school.edit_school.block_reason')}</Label>
              <Input
                id="blockReason"
                value={formData.blockReason}
                disabled
              />
            </div>
          )}

          {/* Logo Upload */}
          <div>
            <Label>{t('school.edit_school.logo')}</Label>
            <div className="flex items-center gap-4 mt-2">
              {formData.logoUrl ? (
                <img
                  src={
                    formData.logoUrl?.startsWith("blob:")
                      ? formData.logoUrl
                      : `${BASE_URL}/../document/${formData.logoUrl}`
                  }
                  alt={t('school.edit_school.logo_alt')}
                  className="h-16 w-16 rounded-md object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <input
                type="file"
                ref={logoInputRef}
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploading.logo}
              >
                {uploading.logo ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {formData.logoUrl 
                  ? t('school.edit_school.change_logo') 
                  : t('school.edit_school.upload_logo')}
              </Button>
            </div>
          </div>

          {/* Documents */}
          <div>
            <Label>{t('school.edit_school.documents')}</Label>
            <div className="mt-2 space-y-2">
              {formData.documents?.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <a
                      href={`${BASE_URL}/../document${doc}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      {t('school.edit_school.document')} {index + 1}
                    </a>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(index)}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <input
                type="file"
                ref={documentInputRef}
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'document')}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => documentInputRef.current?.click()}
                disabled={uploading.document}
              >
                {uploading.document ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {t('school.edit_school.add_document')}
              </Button>
            </div>
          </div>

          {/* Membership Access */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="memberShipAccessStatus"
              checked={formData.memberShipAccessStatus}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                memberShipAccessStatus: e.target.checked
              }))}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="memberShipAccessStatus">
              {t('school.edit_school.membership_access')}
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            {t('school.edit_school.cancel')}
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('school.edit_school.saving')}
              </>
            ) : (
              t('school.edit_school.save_changes')
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default EditSchoolPage;