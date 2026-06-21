import RegisterForm from "@/components/RegisterForm";

export default function Register() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6">
      <h1 className="mb-6 text-xl font-semibold text-navy">PreLegal</h1>
      <RegisterForm />
    </div>
  );
}
