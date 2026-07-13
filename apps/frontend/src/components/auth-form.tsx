import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "#/components/ui/button";
import { Field, FieldContent, FieldError } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { authClient } from "#/lib/auth-client";

const signInSchema = z.object({
	email: z.string().min(1, "Email is required").email("Invalid email"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = signInSchema.extend({
	name: z.string().min(1, "Name is required").max(100),
});

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;

interface AuthFormProps {
	onSuccess: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
	const [isSignUp, setIsSignUp] = useState(false);
	const [serverError, setServerError] = useState("");

	const schema = isSignUp ? signUpSchema : signInSchema;

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<SignInData | SignUpData>({
		resolver: zodResolver(schema),
		defaultValues: isSignUp
			? { name: "", email: "", password: "" }
			: { email: "", password: "" },
	});

	const onFormSubmit = async (data: SignInData | SignUpData) => {
		setServerError("");
		if (isSignUp) {
			const { name, email, password } = data as SignUpData;
			const { error } = await authClient.signUp.email({
				email,
				password,
				name,
			});
			if (error) {
				setServerError(error.message || error.code || "Something went wrong");
				return;
			}
		} else {
			const { email, password } = data;
			const { error } = await authClient.signIn.email({ email, password });
			if (error) {
				setServerError(error.message || error.code || "Invalid credentials");
				return;
			}
		}
		onSuccess();
	};

	const toggleMode = () => {
		setIsSignUp(!isSignUp);
		setServerError("");
		reset();
	};

	return (
		<div className="w-full max-w-sm space-y-6">
			<div className="text-center">
				<h1 className="text-2xl font-bold">Google Keep Clone</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					{isSignUp ? "Create an account" : "Sign in to your account"}
				</p>
			</div>
			<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
				{isSignUp && (
					<Field>
						<FieldContent>
							<Input placeholder="Name" {...register("name")} required />
							{errors.name && <FieldError errors={[errors.name]} />}
						</FieldContent>
					</Field>
				)}
				<Field>
					<FieldContent>
						<Input
							type="email"
							placeholder="Email"
							{...register("email")}
							required
						/>
						{errors.email && <FieldError errors={[errors.email]} />}
					</FieldContent>
				</Field>
				<Field>
					<FieldContent>
						<Input
							type="password"
							placeholder="Password"
							{...register("password")}
							required
						/>
						{errors.password && <FieldError errors={[errors.password]} />}
					</FieldContent>
				</Field>
				{serverError && (
					<p className="text-sm text-destructive">{serverError}</p>
				)}
				<Button type="submit" className="w-full" disabled={isSubmitting}>
					{isSubmitting ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
				</Button>
			</form>
			<p className="text-center text-sm text-muted-foreground">
				{isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
				<button
					type="button"
					className="underline hover:text-foreground"
					onClick={toggleMode}
				>
					{isSignUp ? "Sign In" : "Sign Up"}
				</button>
			</p>
		</div>
	);
}
