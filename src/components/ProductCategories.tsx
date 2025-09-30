import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flower, Candy, Wind, Droplet } from "lucide-react";

const categories = [
  {
    icon: Flower,
    name: "THCA Flower",
    description: "Premium strains, lab-tested",
    popular: true,
  },
  {
    icon: Candy,
    name: "Edibles",
    description: "Gummies, chocolates, more",
    popular: false,
  },
  {
    icon: Wind,
    name: "Vapes",
    description: "Cartridges and disposables",
    popular: true,
  },
  {
    icon: Droplet,
    name: "Concentrates",
    description: "Wax, shatter, diamonds",
    popular: false,
  },
];

const ProductCategories = () => {
  return (
    <section className="py-20 bg-gradient-hero">
      <div className="container px-4 mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">Shop by Category</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our full range of legal THCA products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card 
                key={index} 
                className="relative border-2 hover:border-primary transition-all duration-300 cursor-pointer hover:shadow-strong hover:-translate-y-1"
              >
                {category.popular && (
                  <div className="absolute -top-3 -right-3 px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full">
                    Popular
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button variant="hero" size="lg">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
