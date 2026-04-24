import {
  ForgotPasswordValues,
  SignInValues,
  SignUpValues,
} from '@/lib/schema/auth';
import { SignInForm } from '@/components/auth/sign-in-form';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { SignUpForm } from '@/components/auth/sign-up-form';

type AuthFormProps =
  | {
      mode: 'sign-in';
      onSubmit: (data: SignInValues) => void | Promise<void>;
      isLoading?: boolean;
    }
  | {
      mode: 'sign-up';
      onSubmit: (data: SignUpValues) => void | Promise<void>;
      isLoading?: boolean;
    }
  | {
      mode: 'forgot-password';
      onSubmit: (data: ForgotPasswordValues) => void | Promise<void>;
      isLoading?: boolean;
    };

export function AuthForm(props: AuthFormProps) {
  if (props.mode === 'sign-in') return <SignInForm {...props} />;
  if (props.mode === 'sign-up') return <SignUpForm {...props} />;
  return <ForgotPasswordForm {...props} />;
}
