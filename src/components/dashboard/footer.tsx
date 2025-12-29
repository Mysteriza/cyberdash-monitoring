import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

const socialLinks = [
  {
    href: 'https://github.com/mysteriza',
    icon: <Github className="h-5 w-5" />,
    label: 'GitHub',
  },
];

export default function Footer() {
  return (
    <footer className="mt-8">
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center space-x-2">
          {socialLinks.map((link) => (
            <Button
              key={link.label}
              variant="ghost"
              size="icon"
              asChild
              className="text-muted-foreground transition-all hover:text-accent"
            >
              <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                {link.icon}
              </a>
            </Button>
          ))}
        </div>
        <span className="text-sm font-medium text-muted-foreground">Mysteriza</span>
      </div>
    </footer>
  );
}