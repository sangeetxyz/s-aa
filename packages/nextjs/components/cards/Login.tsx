"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthenticate, useSignerStatus } from "@alchemy/aa-alchemy/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

const Login = () => {
  const { authenticate } = useAuthenticate();
  const { status } = useSignerStatus();
  const isAwaitingEmail = status === "AWAITING_EMAIL_AUTH";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    authenticate({ type: "email", email: values.email });
  }

  return (
    <Card className="w-[21rem] md:w-96">
      <CardHeader>
        <CardTitle>{isAwaitingEmail ? "Waiting..." : "Login now"}</CardTitle>
        <CardDescription>
          {isAwaitingEmail ? "We have sent you an email to authenticate." : "Experience the Embedded Accounts!"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAwaitingEmail ? (
          <div className="flex flex-col items-center space-y-6">
            <Image src={"/email.svg"} alt="Email" width={100} height={100} className="w-40" />

            <Link
              href="https://mail.google.com/mail/u/0/#inbox"
              rel="noopener noreferrer"
              target="_blank"
              // className="self-end"
            >
              <Button>Check mail</Button>
            </Link>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@email.xyz" {...field} />
                    </FormControl>
                    <FormDescription>We&apos;ll send you an email to authenticate.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default Login;
