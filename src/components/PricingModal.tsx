import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSubscription, Tier } from "@/context/SubscriptionContext";
import { Check, Zap, Video, Star, Crown, Globe } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function PricingModal() {
    const { isPricingModalOpen, closePricingModal, upgradeTier, tier, addCredits } = useSubscription();
    const [loading, setLoading] = useState(false);

    const handleAction = async (action: 'ad' | 'buy_pack' | 'scholar' | 'pro') => {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (action === 'ad') {
            await addCredits(5, 'fuel');
            toast.success("Thanks for watching! +5 Fuel Credits earned.");
        } else if (action === 'buy_pack') {
            await addCredits(40, 'power');
            toast.success("Power Pack Purchased! +40 Power Credits added.");
        } else if (action === 'scholar') {
            await upgradeTier('Scholar');
        } else if (action === 'pro') {
            await upgradeTier('Pro');
        }
        setLoading(false);
    };

    return (
        <Dialog open={isPricingModalOpen} onOpenChange={closePricingModal}>
            <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-center pb-6">
                    <DialogTitle className="text-3xl font-bold">Choose Your Fuel</DialogTitle>
                    <DialogDescription className="text-lg">Power your research with the perfect plan.</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Free Tier */}
                    <PricingCard
                        title="Ad-Boosted"
                        price="Free"
                        description="For casual explorers"
                        features={[
                            "10 Fuel Credits / month",
                            "Watch ads for +3 credits",
                            "Access to Chat Mode"
                        ]}
                        icon={<Zap className="w-5 h-5 text-yellow-500" />}
                        current={tier === 'Free'}
                        action={() => handleAction('ad')}
                        actionLabel={loading ? "Watching..." : "Watch Ad (+3 Credits)"}
                        disabled={loading}
                    />

                    {/* Power Pack */}
                    <PricingCard
                        title="Power Pack"
                        price="$1.99"
                        subPrice="Pay-as-you-Go"
                        description="Instant boost"
                        features={[
                            "50 Power Credits",
                            "Never expires",
                            "Full Vision & PDF access"
                        ]}
                        icon={<Star className="w-5 h-5 text-orange-500" />}
                        action={() => handleAction('buy_pack')}
                        actionLabel={loading ? "Processing..." : "Buy Pack"}
                        highlight
                        disabled={loading}
                    />

                    {/* Scholar */}
                    <PricingCard
                        title="Scholar"
                        price="$9.99"
                        subPrice="/ month"
                        description="For students"
                        features={[
                            "300 Monthly Credits",
                            "10 Free Search Queries",
                            "100% Ad-free"
                        ]}
                        icon={<Crown className="w-5 h-5 text-blue-500" />}
                        current={tier === 'Scholar'}
                        action={() => handleAction('scholar')}
                        actionLabel={loading ? "Upgrading..." : "Subscribe"}
                        disabled={loading || tier === 'Scholar' || tier === 'Pro'}
                    />

                    {/* Pro Researcher */}
                    <PricingCard
                        title="Pro Researcher"
                        price="$19.99"
                        subPrice="/ month"
                        description="For power users"
                        features={[
                            "1,000 Monthly Credits",
                            "Unlimited Simple Chat",
                            "Unlimited Voice Notes",
                            "Priority Support"
                        ]}
                        icon={<Globe className="w-5 h-5 text-indigo-500" />}
                        current={tier === 'Pro'}
                        action={() => handleAction('pro')}
                        actionLabel={loading ? "Upgrading..." : "Subscribe"}
                        disabled={loading || tier === 'Pro'}
                        isPro
                    />

                </div>
            </DialogContent>
        </Dialog>
    );
}

function PricingCard({ title, price, subPrice, description, features, icon, current, action, actionLabel, highlight, disabled, isPro }: any) {
    return (
        <div className={`
      relative p-6 rounded-2xl border flex flex-col h-full bg-card
      ${highlight ? 'border-primary shadow-lg scale-105 z-10' : 'border-border'}
      ${isPro ? 'bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-500/30' : ''}
    `}>
            {highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    Best Value
                </div>
            )}

            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-muted">{icon}</div>
                <h3 className="font-semibold text-lg">{title}</h3>
            </div>

            <div className="mb-4">
                <span className="text-2xl font-bold">{price}</span>
                {subPrice && <span className="text-muted-foreground text-sm ml-1">{subPrice}</span>}
            </div>

            <p className="text-sm text-muted-foreground mb-6">{description}</p>

            <ul className="space-y-3 mb-8 flex-1">
                {features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            {current ? (
                <Button disabled variant="outline" className="w-full">Current Plan</Button>
            ) : (
                <Button
                    onClick={action}
                    disabled={disabled}
                    variant={highlight ? "default" : "secondary"}
                    className="w-full"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
