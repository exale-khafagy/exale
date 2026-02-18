import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-exale-dark">
      <SignUp
        appearance={{
          variables: { colorPrimary: '#6A4DFF' },
        }}
        forceRedirectUrl="/"
        signInUrl="/sign-in"
      />
    </div>
  );
}
