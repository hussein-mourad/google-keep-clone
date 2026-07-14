import "dotenv/config";
import { db } from "./index";
import { user, account } from "./schema/auth";
import { labels, noteLabels } from "./schema/labels";
import { notesTable } from "./schema/notes";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

const USERS = [
	{ name: "Alice Johnson", email: "alice@example.com", password: "password123" },
	{ name: "Bob Smith", email: "bob@example.com", password: "password123" },
	{ name: "Charlie Brown", email: "charlie@example.com", password: "password123" },
];

const COLORS = [null, null, null, "#f28b82", "#fbbc04", "#fff475", "#ccff90", "#a7ffeb", "#cbf0f8", "#aecbfa", "#d7aefb", "#fdcfe8", "#e6c9a8", "#e8eaed"];

const LABEL_NAMES = [
	"Work", "Personal", "Ideas", "Projects", "Urgent",
	"Reading", "Health", "Finance", "Travel", "Recipes",
	"Shopping", "Goals", "Books", "Movies", "Music",
	"Fitness", "Learning", "Home", "Garden", "Pets",
];

const NOTE_TITLES = [
	"Meeting notes", "Grocery list", "Project ideas", "Book recommendations",
	"Workout plan", "Budget breakdown", "Travel itinerary", "Recipe collection",
	"Morning routine", "Weekly goals", "Reading list", "Gift ideas",
	"Home improvement", "Birthday reminders", "Movie watchlist", "Music playlist",
	"Learning roadmap", "Career goals", "Side project", "Journal entry",
	"Health tips", "Self-care reminders", "Meditation notes", "Yoga poses",
	"Coffee shop reviews", "Podcast recommendations", "App ideas", "Design concepts",
	"Writing prompts", "Photography tips", "Garden planning", "Pet care tips",
	"Phone setup", "Computer shortcuts", "Keyboard layout", "Coding snippets",
	"API documentation", "Database schema", "Deployment checklist", "Bug tracker",
	"Feature requests", "User feedback", "Competitor analysis", "Market research",
	"Social media plan", "Email templates", "Presentation notes", "Interview prep",
	"Resume updates", "Networking contacts", "Conference notes", "Workshop ideas",
	"Holiday plans", "Weekend activities", "Date night ideas", "Family recipes",
	"Cleaning schedule", "Laundry tips", "Meal prep", "Pantry inventory",
	"Insurance info", "Tax documents", "Investment tracking", "Savings goals",
	"Credit card rewards", "Bank statements", "Utility bills", "Subscription list",
	"Password manager", "Two-factor auth", "Security checklist", "Backup plan",
	"Cloud storage", "File organization", "Archive system", "Trash management",
	"Color palette", "Typography notes", "Icon set", "UI components",
	"Accessibility tips", "Performance metrics", "Load testing", "Security audit",
	"Code review notes", "Refactoring plan", "Tech debt log", "Architecture diagram",
	"Database optimization", "Caching strategy", "Rate limiting", "Error handling",
	"Logging setup", "Monitoring alerts", "Incident response", "Recovery plan",
	"Team standup", "Sprint planning", "Retrospective", "Demo prep",
];

const NOTE_CONTENTS = [
	"Today's meeting went well. We discussed the new feature rollout and timeline for Q3.",
	"Milk, eggs, bread, butter, cheese, tomatoes, onions, garlic, chicken breast, rice.",
	"Build a personal finance tracker with budget categories and monthly reports.",
	"The Pragmatic Programmer, Clean Code, Design Patterns, Refactoring, Domain-Driven Design.",
	"Monday: Chest and triceps. Tuesday: Back and biceps. Wednesday: Rest. Thursday: Legs. Friday: Shoulders.",
	"Monthly income: $5000. Rent: $1500. Groceries: $400. Utilities: $150. Savings: $1000.",
	"Day 1: Tokyo - Shibuya, Shinjuku. Day 2: Kyoto - Temples. Day 3: Osaka - Street food.",
	"Sourdough bread: 500g flour, 350g water, 10g salt, 200g starter. Mix, fold, rest, bake.",
	"6:00 AM - Wake up. 6:30 - Meditation. 7:00 - Exercise. 8:00 - Breakfast. 9:00 - Work.",
	"Complete TypeScript course. Read 2 books. Run 3 times per week. Save $500 this month.",
	"The Pragmatic Programmer (Chapter 5-8), Clean Architecture (Part 2), Thinking Fast and Slow.",
	"Mom's birthday - new kitchen gadget. Dad - golf accessories. Sibling - gift card.",
	"Fix leaky faucet in bathroom. Paint bedroom. Install new light fixtures.",
	"Alice - March 15. Bob - April 22. Charlie - June 8. Diana - July 4.",
	"Dune Part Two, Oppenheimer, Poor Things, The Holdovers, Past Lives.",
	"Indie folk playlist, Jazz classics, Lo-fi beats for coding, Workout mix.",
	"Focus on compound movements. Track progressive overload. Increase protein intake.",
	"Finish React Advanced course. Start learning Rust. Practice system design problems.",
	"Declutter garage. Organize closet. Deep clean kitchen. Fix squeaky door.",
	"Dog needs vet appointment. Cat food running low. Clean fish tank.",
	"Set up password manager for all accounts. Enable 2FA everywhere.",
	"Practice gratitude journaling every morning. Limit social media to 30 min/day.",
	"Start with 5 min breathing exercises. Progress to 20 min guided meditation.",
	"Sun salutation, warrior sequence, tree pose, child's pose, savasana.",
	"Best espresso downtown. Cozy ambiance at the corner cafe. Great pastries nearby.",
	"Lex Fridman podcast episode on AI. Huberman Lab on sleep. Syntax FM on web dev.",
	"Habit tracker app with gamification. Voice memo organizer. Plant watering reminder.",
	"Use CSS Grid for complex layouts. Container queries for responsive components.",
	"Write about lessons learned this year. Describe your ideal day in detail.",
	"Golden hour photography. Composition rules. Post-processing workflow.",
	"Spring: tomatoes, basil. Summer: peppers, squash. Fall: kale, carrots.",
	"Monthly vet checkups. Daily walks. Balanced diet. Grooming schedule.",
	"Update OS. Clear cache. Organize desktop. Back up photos.",
	"VS Code shortcuts cheat sheet. Terminal aliases. Git workflow improvements.",
	"QWERTY optimization tips. Split keyboard benefits. Mechanical key recommendations.",
	"React hooks patterns. SQL query optimization. Docker compose examples.",
	"REST API best practices. GraphQL schema design. WebSocket implementation.",
	"PostgreSQL indexing strategies. Redis caching patterns. MongoDB aggregation.",
	"Container health checks. Load balancer config. SSL certificate renewal.",
	"Exception handling middleware. Structured logging format. Error boundary patterns.",
	"ELK stack setup. Prometheus metrics. Grafana dashboards. PagerDuty alerts.",
	"Kubernetes pod restart policy. Database connection pooling. Cache invalidation.",
	"Team sync agenda items. Blockers and dependencies. Action items owner.",
	"Sprint velocity tracking. Backlog grooming. Story point estimation.",
	"What went well. What to improve. Action items for next sprint.",
	"Live demo preparation steps. Backup slides ready. Video recording setup.",
	"Beach trip packing list. Hotel reservations confirmed. Car rental booked.",
	"Hiking trail on Saturday. Farmers market on Sunday. Board game night Friday.",
	"Italian restaurant downtown. Sunset picnic at the park. Museum exhibit tour.",
	"Grandma's pasta sauce recipe. Holiday cookie traditions. Family taco night.",
	"Weekly cleaning checklist. Monthly deep clean schedule. Seasonal declutter plan.",
	"Meal prep Sunday: chicken, rice, vegetables. Breakfast: overnight oats.",
	"Buy in bulk from warehouse store. Use coupons app. Compare unit prices.",
	"Auto-pay for rent and utilities. Review subscriptions quarterly. Track expenses daily.",
	"Emergency fund target: 6 months expenses. Vacation fund: $2000. New car fund: $5000.",
	"Maximize travel rewards. Cashback on groceries. Points for dining.",
	"Download statements monthly. Categorize spending. Review budget vs actual.",
	"Set up automatic bill payments. Compare insurance rates. Negotiate cable bill.",
	"Netflix, Spotify, gym, cloud storage, password manager, news subscription.",
	"Generate strong unique passwords. Store recovery codes safely. Update quarterly.",
	"Enable 2FA on email, banking, social media. Store backup codes offline.",
	"Test backup restore process. Update recovery contacts. Review data retention.",
	"Google Drive for documents. iCloud for photos. External drive for archives.",
	"Folder hierarchy: Year > Category > Project. Consistent naming conventions.",
	"Archive completed projects. Remove duplicates. Compress old media files.",
	"Empty trash weekly. Review recycle bin before permanent deletion.",
	"Primary: deep blue. Secondary: warm gold. Accent: soft coral.",
	"Body text: 16px minimum. Headings: scale ratio 1.25. Line height: 1.5.",
	"Lucide icons for consistency. 24px default size. Stroke width: 1.5.",
	"Button variants: primary, secondary, ghost, destructive. Consistent padding.",
	"WCAG 2.1 AA compliance. Color contrast ratios. Focus visible indicators.",
	"Lighthouse score target: 90+. Core Web Vitals thresholds. Bundle size budget.",
	"Load test with 1000 concurrent users. Measure p95 response time. Identify bottlenecks.",
	"Dependency audit. OWASP top 10 review. Penetration testing schedule.",
	"Check for anti-patterns. Verify error handling. Review test coverage.",
	"Extract shared utilities. Consolidate duplicate logic. Update outdated patterns.",
	"Document known issues. Prioritize by impact. Estimate fix effort.",
	"Microservices vs monolith trade-offs. Event-driven architecture. CQRS pattern.",
	"Add indexes for frequent queries. Implement connection pooling. Enable query caching.",
	"Redis for session storage. CDN for static assets. Browser caching headers.",
	"Rate limit by IP and user. Sliding window algorithm. Graceful degradation.",
	"Custom error classes. User-friendly messages. Structured error responses.",
	"Winston logger configuration. Request correlation IDs. Log level management.",
	"CPU usage alerts. Memory threshold warnings. Disk space monitoring.",
	"Runbook for common incidents. Escalation procedures. Communication templates.",
	"Point-in-time recovery. Cross-region replication. Regular restore testing.",
];

function pickRandom<T>(arr: T[], count: number): T[] {
	const shuffled = [...arr].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count);
}

function randomDate(daysBack: number): Date {
	const now = Date.now();
	const past = now - daysBack * 24 * 60 * 60 * 1000;
	return new Date(past + Math.random() * (now - past));
}

async function seed() {
	console.log("Seeding database...");

	// Delete in order: note_labels -> notes -> labels -> accounts -> users
	await db.delete(noteLabels);
	await db.delete(notesTable);
	await db.delete(labels);
	await db.delete(account);
	await db.delete(user);
	console.log("Cleaned existing data.");

	// Create users via better-auth (handles password hashing + account creation)
	const createdUserIds: string[] = [];
	for (const u of USERS) {
		const result = await auth.api.signUpEmail({
			body: { name: u.name, email: u.email, password: u.password },
		});
		createdUserIds.push(result.user.id);
		console.log(`Created user: ${u.name} (${u.email})`);
	}

	// Create labels and notes for each user
	for (let uIdx = 0; uIdx < USERS.length; uIdx++) {
		const u = USERS[uIdx];
		const userId = createdUserIds[uIdx];

		// Create 20 labels
		const createdLabels = [];
		for (let i = 0; i < LABEL_NAMES.length; i++) {
			const [label] = await db
				.insert(labels)
				.values({
					name: LABEL_NAMES[i],
					userId,
					createdAt: randomDate(90),
					updatedAt: randomDate(30),
				})
				.returning();
			createdLabels.push(label);
		}
		console.log(`Created ${createdLabels.length} labels for ${u.name}`);

		// Prepare 100 notes with varied states
		const notesToCreate: Array<{
			title: string;
			content: string;
			userId: string;
			isPinned: boolean;
			color: string | null;
			isArchived: boolean;
			isDeleted: boolean;
			deletedAt: Date | null;
			sortOrder: number;
			createdAt: Date;
			updatedAt: Date;
			labelCount: number;
		}> = [];

		for (let i = 0; i < 100; i++) {
			const title = NOTE_TITLES[i % NOTE_TITLES.length];
			const content = NOTE_CONTENTS[i % NOTE_CONTENTS.length];

			let isPinned = false;
			let isArchived = false;
			let isDeleted = false;
			let deletedAt: Date | null = null;
			let color: string | null = null;

			if (i < 10) {
				isPinned = true;
			} else if (i < 15) {
				isArchived = true;
			} else if (i < 20) {
				isDeleted = true;
				deletedAt = randomDate(30);
			} else if (i < 25) {
				isPinned = true;
				isArchived = true;
			} else if (i < 30) {
				color = COLORS[Math.floor(Math.random() * COLORS.length)];
			}

			let labelCount = 0;
			if (i >= 25 && i < 80) {
				labelCount = Math.floor(Math.random() * 3) + 1;
			}

			notesToCreate.push({
				title: `${title} #${i + 1}`,
				content,
				userId,
				isPinned,
				color,
				isArchived,
				isDeleted,
				deletedAt,
				sortOrder: i,
				createdAt: randomDate(90),
				updatedAt: randomDate(30),
				labelCount,
			});
		}

		// Insert all notes
		const insertedNotes = [];
		for (const noteData of notesToCreate) {
			const { labelCount, ...insertData } = noteData;
			const [note] = await db.insert(notesTable).values(insertData).returning();
			insertedNotes.push({ ...note, labelCount });
		}

		// Link notes to labels
		let linkCount = 0;
		for (const note of insertedNotes) {
			if (note.labelCount > 0) {
				const randomLabels = pickRandom(createdLabels, note.labelCount);
				for (const label of randomLabels) {
					await db.insert(noteLabels).values({
						noteId: note.id,
						labelId: label.id,
					});
					linkCount++;
				}
			}
		}

		const pinned = insertedNotes.filter((n) => n.isPinned).length;
		const archived = insertedNotes.filter((n) => n.isArchived).length;
		const deleted = insertedNotes.filter((n) => n.isDeleted).length;
		const colored = insertedNotes.filter((n) => n.color).length;
		console.log(
			`Created ${insertedNotes.length} notes for ${u.name} (${pinned} pinned, ${archived} archived, ${deleted} deleted, ${colored} colored) + ${linkCount} label links`,
		);
	}

	console.log("\nSeed complete!");
	console.log(`  Users:  ${USERS.length} (all password: password123)`);
	console.log(`  Labels: ${LABEL_NAMES.length * USERS.length}`);
	console.log(`  Notes:  ${100 * USERS.length}`);
}

seed()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error("Seed failed:", err);
		process.exit(1);
	});
