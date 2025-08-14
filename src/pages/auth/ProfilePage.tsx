import { useState, useRef, useEffect } from "react";
import { UpdateProfileData, useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Camera, Eye, EyeOff, Check, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ProfilePage = () => {
  const { user, updateProfile, changePassword, getProfile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState<UpdateProfileData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    gender: "male",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
        gender: user.gender || "male",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      toast({
        title: t('profile.updateSuccess'),
        variant: "default",
      });
      setEditMode(false);
      await getProfile(); // Refresh user data
    } catch (error) {
      toast({
        title: t('profile.updateError'),
        description: error instanceof Error ? error.message : t('profile.updateErrorDesc'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await changePassword(passwordData);
      toast({
        title: t('profile.passwordSuccess'),
        variant: "default",
      });
      setPasswordMode(false);
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (error) {
      toast({
        title: t('profile.passwordError'),
        description: error instanceof Error ? error.message : t('profile.passwordErrorDesc'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setAvatarLoading(true);
    
    try {
      // Simulate upload - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would:
      // 1. Upload the file to your server
      // 2. Get back the URL of the uploaded image
      // 3. Update the user's profile with the new avatar URL
      // 4. Example: await updateProfile({ avatar: uploadedImageUrl });
      
      toast({
        title: t('profile.avatarSuccess'),
        variant: "default",
      });
      await getProfile(); // Refresh user data
    } catch (error) {
      toast({
        title: t('profile.avatarError'),
        variant: "destructive",
      });
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-0">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
              {!editMode && !passwordMode && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditMode(true)}
                  >
                    {t('profile.editButton')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPasswordMode(true)}
                  >
                    {t('profile.changePasswordButton')}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {passwordMode ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t('profile.currentPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('profile.newPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setPasswordMode(false)}
                    disabled={loading}
                  >
                    {t('profile.cancel')}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {t('profile.savePassword')}
                  </Button>
                </div>
              </form>
            ) : editMode ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition-colors"
                    >
                      {avatarLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('profile.firstName')}</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('profile.lastName')}</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('profile.email')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={user.email}
                      onChange={handleInputChange}
                      required
                      disabled // Email typically shouldn't be editable
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">{t('profile.phone')}</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">{t('profile.gender')}</Label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="male">{t('profile.genderMale')}</option>
                      <option value="female">{t('profile.genderFemale')}</option>
                      <option value="other">{t('profile.genderOther')}</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setEditMode(false)}
                    disabled={loading}
                  >
                    {t('profile.cancel')}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {t('profile.save')}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t('profile.firstName')}</p>
                    <p className="font-medium">{user.firstName}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t('profile.lastName')}</p>
                    <p className="font-medium">{user.lastName}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t('profile.email')}</p>
                    <p className="font-medium">{user.email}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t('profile.phone')}</p>
                    <p className="font-medium">{user.phoneNumber || "-"}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t('profile.gender')}</p>
                    <p className="font-medium">
                      {user.gender === "male" 
                        ? t('profile.genderMale')
                        : user.gender === "female" 
                          ? t('profile.genderFemale')
                          : t('profile.genderOther')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;