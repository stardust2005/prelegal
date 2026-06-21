import LoginForm from "@/components/LoginForm";

export default function Login() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6">
      <h1 className="mb-6 text-xl font-semibold text-[#032147]">PreLegal</h1>
      <LoginForm />
    </div>
  );
}
