import React from "react";
import { useAccount } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "../components/ui";
import {
  ArrowRight,
  Shield,
  Vote,
  Users,
  Zap,
  Github,
  Mail,
  Twitter,
} from "lucide-react";

interface HomePageProps {
  onGetStarted: () => void;
  onJoinDAO: () => void;
  onStartVerification: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onGetStarted,
  onJoinDAO,
  onStartVerification,
}) => {
  const { isConnected } = useAccount();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <Badge variant="outline" className="text-sm px-4 py-2">
            🚀 Powered by vLayer & Blockscout
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight">
            Decentralized Governance
            <br />
            <span className="text-primary">
              with Privacy-First Verification
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Build reputation-based DAOs with cryptographic proof of your digital
            identity. Verify Twitter actions, email domains, and GitHub
            contributions without exposing sensitive data.
          </p>
        </div>

        {/* Hackathon Innovation Highlights */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 mt-8">
          <div className="text-center space-y-3">
            <Badge variant="default" className="text-sm px-4 py-2">
              🏆 ETH Prague 2024 Hackathon Innovation
            </Badge>
            <h3 className="text-xl font-semibold">
              Revolutionary Governance Algorithm
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              First-ever implementation of weighted heuristic voting with
              cross-chain reputation tracking, dynamic feedback loops, and
              privacy-preserving verification using vLayer proofs.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">100%</div>
            <div className="text-sm text-muted-foreground">
              Privacy Preserved
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">Zero</div>
            <div className="text-sm text-muted-foreground">Data Exposure</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">∞</div>
            <div className="text-sm text-muted-foreground">
              Verification Types
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Technical Innovations</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Breakthrough algorithms and mechanisms that revolutionize DAO
            governance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Vote className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">
                  Weighted Heuristic Algorithm
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base space-y-2">
                <p>Revolutionary voting weight calculation that considers:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>
                    <strong>Cross-chain token holdings</strong> - Your tokens
                    across multiple chains
                  </li>
                  <li>
                    <strong>DAO-specific reputation</strong> - Earned through
                    participation and contributions
                  </li>
                  <li>
                    <strong>Verification completeness</strong> - Twitter,
                    GitHub, email domain proofs
                  </li>
                  <li>
                    <strong>Historical voting patterns</strong> - Consistency
                    and engagement metrics
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  V0 Formula: Weight = (Tokens × 0.4) + (Reputation × 0.4) +
                  (Verification × 0.2)
                </p>
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 border-secondary/20">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Zap className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">
                  Dynamic Feedback Loops
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base space-y-2">
                <p>Self-improving governance through continuous feedback:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>
                    <strong>Equal weight feedback voting</strong> - Every member
                    gets 1 vote for feedback
                  </li>
                  <li>
                    <strong>Reputation adjustment</strong> - Voting outcomes
                    affect future reputation
                  </li>
                  <li>
                    <strong>Proposal quality scoring</strong> - Track proposal
                    success rates
                  </li>
                  <li>
                    <strong>Participation rewards</strong> - Active voters gain
                    reputation over time
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Creates a self-balancing ecosystem where good governance is
                  rewarded
                </p>
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 border-green-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">
                  Per-DAO Reputation System
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base space-y-2">
                <p>Contextual reputation that adapts to each DAO:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>
                    <strong>Isolated reputation scores</strong> - Different
                    reputation per DAO
                  </li>
                  <li>
                    <strong>Domain-specific expertise</strong> - DeFi vs Gaming
                    vs Social DAOs
                  </li>
                  <li>
                    <strong>House-based progression</strong> - Reputation grows
                    within DAO houses
                  </li>
                  <li>
                    <strong>Cross-DAO verification</strong> - Base identity
                    proofs transfer
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Prevents reputation farming while rewarding specialized
                  expertise
                </p>
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">
                  Blockscout Merit Quests
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base space-y-2">
                <p>Gamified reputation building through verified actions:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>
                    <strong>vLayer proof quests</strong> - Complete verification
                    challenges
                  </li>
                  <li>
                    <strong>Blockscout merit rewards</strong> - Earn points for
                    on-chain activity
                  </li>
                  <li>
                    <strong>Social verification tasks</strong> - Twitter
                    engagement, GitHub contributions
                  </li>
                  <li>
                    <strong>Progressive difficulty</strong> - Harder quests =
                    more reputation
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Integrates with Blockscout's merit system for cross-platform
                  reputation
                </p>
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Algorithm Deep Dive */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Algorithm Deep Dive</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Technical implementation of our revolutionary governance system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="text-xl font-semibold">
              Identity Verification & Proof Generation
            </h3>
            <p className="text-muted-foreground text-sm">
              <strong>vLayer Integration:</strong> Generate zero-knowledge
              proofs for Twitter follows, GitHub commits, and email DKIM
              signatures.
              <br />
              <br />
              <strong>Cross-chain Token Detection:</strong> Scan multiple chains
              for token holdings using Blockscout APIs.
              <br />
              <br />
              <strong>Reputation Initialization:</strong> Start with base
              reputation score per DAO (default: 100 points).
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="text-xl font-semibold">Weighted Vote Calculation</h3>
            <p className="text-muted-foreground text-sm">
              <strong>Algorithm:</strong>
              <code className="block bg-muted p-2 rounded mt-2 text-xs">
                vote_weight = (token_balance * 0.4) + (dao_reputation * 0.4) +
                (verification_score * 0.2)
              </code>
              <br />
              <strong>Verification Score:</strong> Twitter (30%) + GitHub (40%)
              + Email (30%)
              <br />
              <br />
              <strong>House Multiplier:</strong> Each DAO house can have
              different weight multipliers.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="text-xl font-semibold">
              Feedback Loop & Reputation Update
            </h3>
            <p className="text-muted-foreground text-sm">
              <strong>Feedback Phase:</strong> Equal weight voting (1 vote per
              member) on proposal outcomes.
              <br />
              <br />
              <strong>Reputation Adjustment:</strong>
              <code className="block bg-muted p-2 rounded mt-2 text-xs">
                new_reputation = old_reputation + (feedback_score *
                participation_bonus)
              </code>
              <br />
              <strong>Quest Integration:</strong> Complete Blockscout merit
              quests to boost reputation across all DAOs.
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Flow Explanations */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Implementation Flows</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Step-by-step breakdown of voting, quest, and reputation mechanics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Voting Flow */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl flex items-center space-x-2">
                <Vote className="h-6 w-6 text-primary" />
                <span>Complete Voting Flow</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      Proposal Creation & Weighted Voting
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Members vote YES/NO/ABSTAIN with weights based on
                      reputation + token holdings
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Feedback Phase</p>
                    <p className="text-xs text-muted-foreground">
                      Equal weight voting (1 vote per member) on proposal
                      outcome satisfaction
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      Reputation & Merit Adjustment
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>If proposal passed + positive feedback:</strong>{" "}
                      YES voters gain reputation & Blockscout merits
                      <br />
                      <strong>
                        If proposal passed + negative feedback:
                      </strong>{" "}
                      YES voters lose reputation
                      <br />
                      <strong>Similar logic for failed proposals</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">4</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Weight Recalculation</p>
                    <p className="text-xs text-muted-foreground">
                      Updated reputation affects voting weight for next
                      proposals
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">5</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Accountability Loop</p>
                    <p className="text-xs text-muted-foreground">
                      Feedback creates accountability for decision quality and
                      long-term thinking
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quest Flow */}
          <Card className="border-2 border-secondary/20">
            <CardHeader>
              <CardTitle className="text-xl flex items-center space-x-2">
                <Zap className="h-6 w-6 text-secondary" />
                <span>Quest & Merit System</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-secondary">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">DAO Creates Quest</p>
                    <p className="text-xs text-muted-foreground">
                      Twitter actions (follow, retweet, like), GitHub
                      contributions, or custom tasks
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-secondary">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      Member Completes Quest
                    </p>
                    <p className="text-xs text-muted-foreground">
                      vLayer generates zero-knowledge proof of quest completion
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-secondary">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Reward Distribution</p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Token Rewards:</strong> Optional DAO-specific
                      tokens
                      <br />
                      <strong>Blockscout Merits:</strong> Cross-platform
                      reputation points
                      <br />
                      <strong>DAO Reputation:</strong> Increased standing within
                      the DAO
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs font-medium">Additional Features:</p>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                    <li>
                      • <strong>GitHub Verification:</strong> Prove repository
                      contributions for technical reputation
                    </li>
                    <li>
                      • <strong>Twitter Verification:</strong> Social engagement
                      and community building
                    </li>
                    <li>
                      • <strong>DAO Community Chat:</strong> Real-time
                      discussion and coordination
                    </li>
                    <li>
                      • <strong>Cross-DAO Merit Transfer:</strong> Blockscout
                      merits work across all DAOs
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Verification Types */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">vLayer Proof Implementation</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Zero-knowledge verification across multiple platforms with privacy
            preservation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Twitter className="h-8 w-8 text-blue-500" />
                <div>
                  <CardTitle className="text-xl">
                    Twitter Verification
                  </CardTitle>
                  <Badge variant="default" className="mt-1">
                    ✅ Implemented
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm">
                    Profile ownership verification via vLayer
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm">
                    Follow specific accounts proof
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm">Like and retweet verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm">
                    Reply to specific tweets proof
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <strong>Weight Contribution:</strong> 30% of verification score
                <br />
                <strong>Privacy:</strong> Only proves actions, not content
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 hover:border-green-300 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Mail className="h-8 w-8 text-green-600" />
                <div>
                  <CardTitle className="text-xl">Email Verification</CardTitle>
                  <Badge variant="default" className="mt-1">
                    ✅ Implemented
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm">DKIM signature verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm">Domain ownership proof</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm">
                    Professional credibility scoring
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm">
                    Zero-knowledge domain verification
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <strong>Weight Contribution:</strong> 30% of verification score
                <br />
                <strong>Privacy:</strong> Domain proven without exposing email
                content
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 hover:border-purple-300 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Github className="h-8 w-8 text-purple-600" />
                <div>
                  <CardTitle className="text-xl">GitHub Verification</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    🚧 In Progress
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm">
                    Repository contributions proof
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-orange-500">🔜</span>
                  <span className="text-sm">Commit history verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-orange-500">🔜</span>
                  <span className="text-sm">
                    Branch-specific activity proof
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-orange-500">🔜</span>
                  <span className="text-sm">
                    Open source contribution scoring
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <strong>Weight Contribution:</strong> 40% of verification score
                <br />
                <strong>Privacy:</strong> Proves contributions without exposing
                code
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="bg-muted/30 rounded-2xl p-8 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">
            Built on Cutting-Edge Technology
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powered by vLayer and Blockscout - the future of blockchain
            verification and exploration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="font-semibold">vlayer Proofs</h3>
            <p className="text-sm text-muted-foreground">
              Zero-knowledge web proofs for privacy-preserving verification
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="font-semibold">Blockscout</h3>
            <p className="text-sm text-muted-foreground">
              Transparent blockchain exploration and contract verification
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔗</span>
            </div>
            <h3 className="font-semibold">Base Sepolia</h3>
            <p className="text-sm text-muted-foreground">
              Fast, low-cost blockchain for governance operations
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold">Real-time Updates</h3>
            <p className="text-sm text-muted-foreground">
              Live transaction monitoring and state synchronization
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center space-y-8 bg-primary/5 rounded-2xl p-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join the future of decentralized governance. Build your reputation,
            verify your identity, and participate in meaningful decision-making.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isConnected ? (
            <>
              <Button
                size="lg"
                variant="outline"
                onClick={onJoinDAO}
                className="text-lg px-8 py-6"
              >
                Browse DAOs
                <Users className="ml-2 h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button
              size="lg"
              onClick={onGetStarted}
              className="text-lg px-8 py-6"
            >
              Connect Wallet to Begin
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          Privacy-first • Open source
        </div>
      </section>
    </div>
  );
};
