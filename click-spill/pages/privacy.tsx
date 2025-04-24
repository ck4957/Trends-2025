import Layout from "../components/Layout";

export default function Privacy() {
  return (
    <Layout
      title="Privacy Policy - ClickSpill"
      description="Read our privacy policy to understand how we handle your data."
    >
      <section className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Your privacy is important to us. At ClickSpill, we are committed to
          protecting your personal information and being transparent about our
          data practices.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900 dark:text-white">
          1. No Personal Data Collection
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          We do <span className="font-semibold">not</span> collect, store, or
          process any personal data from our users. You can browse and use
          ClickSpill without providing any personal information.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900 dark:text-white">
          2. No Data Selling or Sharing
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          We do <span className="font-semibold">not</span> sell, trade, or share
          any user data with third parties. Your privacy is fully respected.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900 dark:text-white">
          3. Source of Data
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          All trending topics and news displayed on ClickSpill are collected
          from public sources, primarily Google Trends. We do not generate or
          collect any user-specific data.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900 dark:text-white">
          4. Cookies and Analytics
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          ClickSpill does not use cookies or analytics tools to track your
          activity. Some third-party services (such as ad networks) may use
          cookies, but we do not have access to or control over these cookies.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900 dark:text-white">
          5. Third-Party Links
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Our website may contain links to third-party websites. We are not
          responsible for the privacy practices or content of those sites.
          Please review their privacy policies if you visit them.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900 dark:text-white">
          6. Changes to This Policy
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          We may update this privacy policy from time to time. Any changes will
          be posted on this page with an updated effective date.
        </p>
      </section>
    </Layout>
  );
}
