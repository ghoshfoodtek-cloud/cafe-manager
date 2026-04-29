import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { signIn, signUp } from '@/lib/supabase-auth';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  requestedRole: z.enum(['admin', 'associate']),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, loading } = useSupabaseAuth();
  const { t } = useTranslation('auth');

  const [signUpForm, setSignUpForm] = useState<{ email: string; password: string; name: string; requestedRole: 'admin' | 'associate' }>({ email: '', password: '', name: '', requestedRole: 'associate' });
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSignUp = async () => {
    try {
      setIsSubmitting(true);

      const validation = signUpSchema.safeParse(signUpForm);
      if (!validation.success) {
        toast({
          title: t('validationError'),
          description: validation.error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }

      const { error } = await signUp(signUpForm.email, signUpForm.password, signUpForm.name);

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: t('accountExists'),
            description: t('accountExistsDesc'),
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('signUpFailed'),
            description: error.message,
            variant: 'destructive',
          });
        }
        return;
      }

      toast({
        title: t('success'),
        description: t('accountCreated'),
      });

      setSignUpForm({ email: '', password: '', name: '' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred during sign up',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsSubmitting(true);

      const validation = signInSchema.safeParse(signInForm);
      if (!validation.success) {
        toast({
          title: t('validationError'),
          description: validation.error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }

      const { error } = await signIn(signInForm.email, signInForm.password);

      if (error) {
        toast({
          title: t('signInFailed'),
          description: error.message === 'Invalid login credentials'
            ? t('invalidCredentials')
            : error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: t('welcomeBack'),
        description: t('signedIn'),
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred during sign in',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sign In / Sign Up - CRM</title>
        <meta name="description" content="Sign in to your account or create a new one" />
      </Helmet>

      <div className="flex items-center justify-center min-h-screen bg-background p-4 relative">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher variant="outline" />
        </div>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('welcome')}</CardTitle>
            <CardDescription>{t('signInDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">{t('signIn')}</TabsTrigger>
                <TabsTrigger value="signup">{t('signUp')}</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">{t('email')}</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={signInForm.email}
                    onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">{t('password')}</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder={t('passwordPlaceholder')}
                    value={signInForm.password}
                    onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                  />
                </div>
                <Button
                  onClick={handleSignIn}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('signingIn') : t('signIn')}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">{t('name')}</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder={t('namePlaceholder')}
                    value={signUpForm.name}
                    onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t('email')}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={signUpForm.email}
                    onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t('password')}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder={t('passwordPlaceholder')}
                    value={signUpForm.password}
                    onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                  />
                  <p className="text-xs text-muted-foreground">{t('passwordHint')}</p>
                </div>
                <Button
                  onClick={handleSignUp}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('creatingAccount') : t('createAccount')}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Auth;
