import { BarChart3, CheckCircle2, Clock3, Users } from "lucide-react";
import type { DashboardSummary } from "@/types";

interface DashboardSummaryCardsProps {
    summary: DashboardSummary;
}

const cards = [
    {
        key: "open_posts",
        label: "Acik Postlarim",
        icon: BarChart3,
        color: "bg-primary text-primary-foreground",
    },
    {
        key: "my_pending_actions",
        label: "Benden Beklenenler",
        icon: Clock3,
        color: "bg-secondary text-secondary-foreground",
    },
    {
        key: "my_posts_liked",
        label: "Gelen Begeniler",
        icon: CheckCircle2,
        color: "bg-accent text-accent-foreground",
    },
    {
        key: "approved_members",
        label: "Onayli Uye",
        icon: Users,
        color: "bg-highlight text-highlight-foreground",
    },
] as const;

const DashboardSummaryCards = ({ summary }: DashboardSummaryCardsProps) => (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
            const Icon = card.icon;
            const value = summary[card.key];

            return (
                <article key={card.key} className="border-4 border-foreground bg-card p-5 shadow-brutal">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-black uppercase text-muted-foreground">{card.label}</p>
                            <p className="mt-2 text-3xl font-black">{value}</p>
                        </div>
                        <div className={`flex h-12 w-12 items-center justify-center border-4 border-foreground ${card.color}`}>
                            <Icon className="h-6 w-6" />
                        </div>
                    </div>
                </article>
            );
        })}
    </section>
);

export default DashboardSummaryCards;
