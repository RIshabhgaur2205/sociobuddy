import { Helmet } from "react-helmet-async";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms and Conditions | Mentorship Platform</title>
        <meta name="description" content="Read our terms and conditions for using the mentorship booking service." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-24 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Terms and Conditions</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">
              Last updated: January 5, 2026
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
              <p>
                By accessing and using our mentorship platform and booking services, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">2. Mentorship Services</h2>
              <p>
                Our platform connects users with mentors for guidance and advice. The mentorship sessions are:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provided for educational and informational purposes only</li>
                <li>Not a substitute for professional advice (legal, financial, medical, etc.)</li>
                <li>Subject to mentor availability and scheduling</li>
                <li>Currently offered free of charge (subject to change with notice)</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">3. User Responsibilities</h2>
              <p>As a user of our platform, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete information when booking sessions</li>
                <li>Attend scheduled sessions on time or cancel with reasonable notice</li>
                <li>Treat mentors with respect and professionalism</li>
                <li>Not share mentor contact information without their consent</li>
                <li>Not record sessions without explicit permission from all parties</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">4. Cancellation Policy</h2>
              <p>
                We understand that schedules can change. To ensure fairness to mentors:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Please cancel or reschedule at least 24 hours before your session</li>
                <li>Repeated no-shows may result in temporary suspension of booking privileges</li>
                <li>Mentors reserve the right to cancel sessions with appropriate notice</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">5. Privacy and Confidentiality</h2>
              <p>
                We value your privacy and confidentiality:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Information shared during sessions should be treated as confidential</li>
                <li>Personal data is handled according to our Privacy Policy</li>
                <li>Session notes are stored securely and accessible only to relevant parties</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">6. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The platform and mentors are not liable for decisions made based on advice given</li>
                <li>We do not guarantee specific outcomes from mentorship sessions</li>
                <li>Technical issues affecting session quality do not constitute grounds for claims</li>
                <li>Users are responsible for their own actions and decisions</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">7. Code of Conduct</h2>
              <p>
                All users must adhere to our code of conduct:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>No harassment, discrimination, or inappropriate behavior</li>
                <li>No solicitation of personal or financial information</li>
                <li>No misrepresentation of identity or credentials</li>
                <li>Violations may result in immediate account termination</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">8. Intellectual Property</h2>
              <p>
                All content, materials, and resources shared during mentorship sessions:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Remain the property of their respective owners</li>
                <li>May not be reproduced or distributed without permission</li>
                <li>Are provided for personal use only</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">9. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Continued use of the platform constitutes acceptance of modified terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">10. Contact Information</h2>
              <p>
                If you have questions about these Terms and Conditions, please contact us through our platform's support channels.
              </p>
            </section>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Terms;
