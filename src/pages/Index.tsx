import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Helmet>
        <title>Dashboard | Bharat Connect Pro</title>
        <meta name="description" content="Internal business management tool for government services CRM." />
        <link rel="canonical" href="/" />
      </Helmet>
      <section className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center text-center">
        <h1 className="mb-4 text-4xl font-bold">Bharat Connect Pro CRM</h1>
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
          Manage client profiles, capture documents via camera or gallery, and track detailed order timelines.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/clients"><Button size="lg">Clients</Button></Link>
          <Link to="/clients/new"><Button size="lg" variant="secondary">New Client</Button></Link>
          <Link to="/orders"><Button size="lg" variant="outline">Orders</Button></Link>
        </div>
      </section>
    </main>
  );
};

export default Index;
