import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { loadJSON, saveJSON } from "@/lib/storage";
import type { Client } from "./Clients";

const schema = z.object({
  fullName: z.string().min(2, "Name is required"),
  age: z.string().optional(),
  phones: z.string().min(10, "Enter at least one phone"),
  address: z.string().optional(),
  city: z.string().optional(),
  village: z.string().optional(),
  block: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const ClientNew = () => {
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { fullName: "", age: "", phones: "", address: "", city: "", village: "", block: "" } });
  const navigate = useNavigate();
  const { toast } = useToast();

  const onSubmit = (values: FormValues) => {
    const list = loadJSON<Client[]>("clients", []);
    const client: Client = {
      id: String(Date.now()),
      fullName: values.fullName.trim(),
      age: values.age ? Number(values.age) : undefined,
      phones: values.phones.split(",").map(p => p.trim()).filter(Boolean),
      address: values.address?.trim(),
      city: values.city?.trim(),
      village: values.village?.trim(),
      block: values.block?.trim(),
      createdAt: new Date().toISOString(),
    };
    list.push(client);
    saveJSON("clients", list);
    toast({ title: "Client created", description: `${client.fullName} has been added.` });
    navigate("/clients");
  };

  return (
    <main className="container mx-auto py-6">
      <Helmet>
        <title>Create Client | Bharat Connect Pro</title>
        <meta name="description" content="Quickly create a new client profile with contacts and address." />
        <link rel="canonical" href="/clients/new" />
      </Helmet>
      <h1 className="mb-6 text-2xl font-semibold">New Client</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-2xl gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl><Input placeholder="e.g., Rohan Sharma" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl><Input type="number" placeholder="e.g., 32" {...field} /></FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phones"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact number(s)</FormLabel>
                <FormControl><Input placeholder="Comma-separated: 9876543210, 9123456789" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl><Textarea placeholder="Street, City, State, PIN" {...field} /></FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl><Input placeholder="e.g., Patna" {...field} /></FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="village"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Village</FormLabel>
                  <FormControl><Input placeholder="e.g., Rampur" {...field} /></FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="block"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Block</FormLabel>
                  <FormControl><Input placeholder="e.g., Danapur" {...field} /></FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit">Create Profile</Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </Form>
    </main>
  );
};

export default ClientNew;
