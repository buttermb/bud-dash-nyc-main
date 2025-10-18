import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const Blog = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Blog - New York Minute NYC"
        description="Cannabis education, NYC delivery insights, and wellness tips from New York Minute NYC's expert team."
      />
      <Navigation />
      <main className="container mx-auto px-4 py-20 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-bold mb-4">Cannabis Education & News</h1>
          <p className="text-lg text-muted-foreground mb-12">
            Learn about cannabis wellness, NYC delivery laws, and more from our expert team.
          </p>

          <div className="space-y-6">
            {posts?.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <Card className="hover:shadow-elegant transition-all duration-300 cursor-pointer border-border/40">
                {post.featured_image_url && (
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{post.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{post.excerpt}</p>
                </CardContent>
              </Card>
            </Link>
          ))}

            {posts?.length === 0 && (
              <Card className="border-border/40">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
