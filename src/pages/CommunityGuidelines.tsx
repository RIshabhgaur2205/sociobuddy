import { Helmet } from "react-helmet-async";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const CommunityGuidelines = () => {
  return (
    <>
      <Helmet>
        <title>Community Guidelines - SocioBuddy</title>
        <meta name="description" content="Read SocioBuddy's community guidelines to understand the standards of behavior expected from all members." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Community Guidelines</h1>
          <p className="text-muted-foreground mb-6">Last updated: January 5, 2025</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Welcome to Our Community</h2>
              <p className="text-foreground/80 leading-relaxed">
                SocioBuddy is a safe space for teenagers to connect, make friends, and overcome social anxiety. To maintain a positive and supportive environment, we ask all members to follow these community guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Be Respectful</h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>Treat everyone with kindness and respect, even if you disagree with them.</li>
                <li>Do not bully, harass, or intimidate other members.</li>
                <li>Respect people's boundaries and personal space.</li>
                <li>Use appropriate language and avoid offensive or hurtful words.</li>
                <li>Celebrate diversity and be inclusive of all backgrounds and identities.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Be Authentic</h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>Use your real identity and accurate information in your profile.</li>
                <li>Do not impersonate others or create fake accounts.</li>
                <li>Be honest about yourself and your intentions.</li>
                <li>Use recent and genuine photos of yourself.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Keep It Safe</h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>Never share personal information like your home address, phone number, or financial details.</li>
                <li>Be cautious when meeting people in person - always meet in public places and tell someone where you're going.</li>
                <li>Report any suspicious or concerning behavior immediately.</li>
                <li>Do not share content that could endanger yourself or others.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Content Standards</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">The following content is not allowed on SocioBuddy:</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li><strong>Inappropriate content:</strong> No nudity, sexually explicit material, or graphic violence.</li>
                <li><strong>Hate speech:</strong> No content that promotes discrimination based on race, ethnicity, religion, gender, sexual orientation, disability, or other protected characteristics.</li>
                <li><strong>Harmful content:</strong> No promotion of self-harm, suicide, eating disorders, or dangerous activities.</li>
                <li><strong>Illegal activities:</strong> No content related to drugs, weapons, or other illegal activities.</li>
                <li><strong>Spam:</strong> No unsolicited commercial messages or repetitive content.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Be Supportive</h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>Remember that many members are working to overcome social anxiety - be patient and understanding.</li>
                <li>Offer encouragement and positive feedback when appropriate.</li>
                <li>If someone seems to be struggling, be supportive and suggest they seek help from trusted adults or professionals.</li>
                <li>Create a welcoming atmosphere for new members.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Reporting Violations</h2>
              <p className="text-foreground/80 leading-relaxed">
                If you encounter content or behavior that violates these guidelines:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80 mt-2">
                <li>Use the report feature to flag the content or user.</li>
                <li>Block users who make you uncomfortable.</li>
                <li>Contact our support team for serious concerns.</li>
                <li>If you believe someone is in immediate danger, contact local emergency services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Consequences</h2>
              <p className="text-foreground/80 leading-relaxed">
                Violations of these guidelines may result in:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80 mt-2">
                <li>Warning or content removal</li>
                <li>Temporary suspension of account</li>
                <li>Permanent ban from the platform</li>
                <li>Report to appropriate authorities if necessary</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Questions?</h2>
              <p className="text-foreground/80 leading-relaxed">
                If you have questions about these guidelines or want to report a concern, please contact us at support@sociobuddy.com or through our Contact Us page.
              </p>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CommunityGuidelines;
