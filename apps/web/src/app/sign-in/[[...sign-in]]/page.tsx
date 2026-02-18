import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-exale-dark">
      <SignIn
        appearance={{
          variables: { colorPrimary: '#6A4DFF' },
        }}
        forceRedirectUrl="/"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
