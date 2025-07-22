import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { useAuthAction } from "@/hooks/use-auth-action";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "wouter";

const adventureSubmissionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  system: z.string().min(1, "RPG system is required"),
  genre: z.string().min(1, "Genre is required"),
  publisher: z.string().min(1, "Publisher is required"),
  yearPublished: z.number().min(1970).max(new Date().getFullYear()),
  theme: z.string().min(1, "Theme is required"),
  adventureType: z.string().min(1, "Adventure type is required"),
  submitterName: z.string().min(1, "Your name is required"),
  submitterEmail: z.string().email("Valid email is required"),
  additionalNotes: z.string().optional()
});

type AdventureSubmissionForm = z.infer<typeof adventureSubmissionSchema>;

export default function SubmitAdventure() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { executeAction, LoginPromptComponent } = useAuthAction();
  const { toast } = useToast();

  const form = useForm<AdventureSubmissionForm>({
    resolver: zodResolver(adventureSubmissionSchema),
    defaultValues: {
      title: "",
      description: "",
      system: "",
      genre: "",
      publisher: "",
      yearPublished: new Date().getFullYear(),
      theme: "",
      adventureType: "",
      submitterName: "",
      submitterEmail: "",
      additionalNotes: ""
    }
  });

  const submitAdventure = useMutation({
    mutationFn: async (data: AdventureSubmissionForm) => {
      const response = await fetch("/api/submit-adventure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error("Failed to submit adventure");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Adventure Submitted!",
        description: "Your adventure has been sent for admin review. Thank you for your contribution!"
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your adventure. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: AdventureSubmissionForm) => {
    executeAction(() => {
      setIsSubmitting(true);
      submitAdventure.mutate(data, {
        onSettled: () => setIsSubmitting(false)
      });
    }, "submit an adventure");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Submit RPG Adventure</h1>
          <p className="text-gray-400">
            Submit a new RPG adventure for review. All submissions will be reviewed by our admin team before being added to the database.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Adventure Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adventure Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Tomb of Horrors" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="system"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RPG System</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., D&D 5e, Call of Cthulhu" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide a detailed description of the adventure..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="genre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genre</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select genre" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fantasy">Fantasy</SelectItem>
                            <SelectItem value="sci-fi">Science Fiction</SelectItem>
                            <SelectItem value="horror">Horror</SelectItem>
                            <SelectItem value="modern">Modern/Urban</SelectItem>
                            <SelectItem value="superhero">Superhero</SelectItem>
                            <SelectItem value="historical">Historical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="publisher"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publisher</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., TSR, Wizards of the Coast" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="yearPublished"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Published</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1970}
                            max={new Date().getFullYear()}
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theme</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="action">Action</SelectItem>
                            <SelectItem value="horror">Horror</SelectItem>
                            <SelectItem value="mystery">Mystery</SelectItem>
                            <SelectItem value="exploration">Exploration</SelectItem>
                            <SelectItem value="political">Political</SelectItem>
                            <SelectItem value="social">Social</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="adventureType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adventure Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="one-shot">One-shot</SelectItem>
                            <SelectItem value="module">Module</SelectItem>
                            <SelectItem value="campaign">Campaign</SelectItem>
                            <SelectItem value="anthology">Anthology</SelectItem>
                            <SelectItem value="setting-book">Setting Book</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Your Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="submitterName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="submitterEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional information about this adventure..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-purple-700 hover:bg-purple-600"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Submitting..." : "Submit Adventure"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        <LoginPromptComponent />
      </div>
    </div>
  );
}