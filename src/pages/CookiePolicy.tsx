import { Helmet } from "react-helmet-async";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const CookiePolicy = () => {
  return (
    <>
      <Helmet>
        <title>Cookie Policy - SocioBuddy</title>
        <meta name="description" content="Learn about how SocioBuddy uses cookies and similar technologies to improve your experience." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
          <p className="text-muted-foreground mb-6">Last updated: January 5, 2025</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
              <p className="text-foreground/80 leading-relaxed">
                Cookies are small text files that are stored on your device when you visit a website. They help websites remember your preferences and improve your browsing experience. Cookies can be "session" cookies (deleted when you close your browser) or "persistent" cookies (remain until they expire or you delete them).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
              <p className="text-foreground/80 leading-relaxed">SocioBuddy uses cookies for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80 mt-2">
                <li><strong>Essential Cookies:</strong> Required for the website to function properly, including authentication and security features.</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences to personalize your experience.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform to improve our services.</li>
                <li><strong>Performance Cookies:</strong> Monitor site performance and help us identify and fix issues.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">Strictly Necessary Cookies</h3>
                  <p className="text-foreground/80">These cookies are essential for you to use our platform. They include authentication tokens and session management cookies.</p>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Functional Cookies</h3>
                  <p className="text-foreground/80">These cookies remember choices you make (such as language preferences) and provide enhanced, personalized features.</p>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Analytics Cookies</h3>
                  <p className="text-foreground/80">We use analytics cookies to collect information about how visitors use our website, which helps us improve our services.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
              <p className="text-foreground/80 leading-relaxed">
                Some cookies on our site are placed by third-party services that appear on our pages. We use third-party services for analytics and may include social media features. These third parties may use cookies to collect information about your online activities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Managing Cookies</h2>
              <p className="text-foreground/80 leading-relaxed">
                You can control and manage cookies in various ways:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80 mt-2">
                <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies through their settings.</li>
                <li><strong>Device Settings:</strong> Your mobile device may have settings to limit ad tracking and cookie usage.</li>
                <li><strong>Opt-Out Tools:</strong> Many analytics providers offer opt-out mechanisms.</li>
              </ul>
              <p className="text-foreground/80 leading-relaxed mt-4">
                Please note that disabling certain cookies may affect the functionality of our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Local Storage</h2>
              <p className="text-foreground/80 leading-relaxed">
                In addition to cookies, we may use local storage to store information in your browser. Local storage is similar to cookies but can store more data. The information stored in local storage is used for the same purposes as cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Updates to This Policy</h2>
              <p className="text-foreground/80 leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in technology or legal requirements. We encourage you to review this page periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
              <p className="text-foreground/80 leading-relaxed">
                If you have any questions about our use of cookies, please contact us at privacy@sociobuddy.com.
              </p>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CookiePolicy;
