import { LogOutIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { authClient } from "#/lib/auth-client";

interface ProfileDropdownProps {
	user: {
		name?: string | null;
		email?: string | null;
		image?: string | null;
	} | null;
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
	const navigate = useNavigate();

	const handleSignOut = async () => {
		await authClient.signOut();
		navigate({ to: "/" });
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="ghost" size="icon" className="rounded-full">
						<Avatar>
							<AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
							<AvatarFallback>{(user?.name ?? "U").charAt(0).toUpperCase()}</AvatarFallback>
						</Avatar>
					</Button>
				}
			/>
			<DropdownMenuContent align="end" className="min-w-48">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col gap-0.5">
							<p className="text-sm font-medium">{user?.name}</p>
							<p className="text-xs text-muted-foreground">
								{user?.email}
							</p>
						</div>
					</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleSignOut}>
					<LogOutIcon className="size-4" />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
