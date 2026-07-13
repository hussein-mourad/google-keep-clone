import { Button } from "#/components/ui/button";

interface HeroSectionProps {
	onSignIn: () => void;
	onGetStarted: () => void;
}

export function HeroSection({ onSignIn, onGetStarted }: HeroSectionProps) {
	return (
		<div className="mx-auto max-w-lg text-center">
			<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
				Keep Your Thoughts Organized
			</h1>
			<p className="mt-4 text-base text-muted-foreground">
				A simple, fast note-taking app. Capture ideas, organize with labels,
				and access them from anywhere.
			</p>
			<div className="mt-8 flex items-center justify-center gap-3">
				<Button size="lg" onClick={onSignIn}>
					Sign In
				</Button>
				<Button variant="outline" size="lg" onClick={onGetStarted}>
					Get Started
				</Button>
			</div>
		</div>
	);
}
