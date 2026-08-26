import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-6 py-16">
      <header>
        <p className="mb-2 text-xs font-bold tracking-wide text-accent-dark uppercase">
          Internal preview
        </p>
        <h1 className="text-3xl">ShiftBeacon design system</h1>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          Core UI primitives ported from prototypes/theme.css. This page is
          temporary scaffolding for visual review and gets replaced by real
          routes in the next feature.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg">Buttons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Clock In</Button>
          <Button variant="secondary">Edit Workplace</Button>
          <Button variant="outline">See how it works</Button>
          <Button variant="destructive">Clock Out</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="link">View shift history</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg">Badges</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge>On shift</Badge>
          <Badge variant="secondary">Off shift</Badge>
          <Badge variant="destructive">Outside perimeter</Badge>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg">Card</h2>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Riverside Care Home</CardTitle>
            <CardDescription>
              42 Riverside Ave, Manchester &middot; 2.0 km radius
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Example workplace card, styled with the hard-border,
              offset-shadow treatment from the mockups.
            </p>
          </CardContent>
          <CardFooter>
            <Button size="sm" className="w-full">
              Clock In
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg">Form fields</h2>
        <div className="flex max-w-sm flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="preview-name"
              className="text-xs font-bold tracking-wide text-muted-foreground uppercase"
            >
              Workplace name
            </label>
            <Input id="preview-name" placeholder="Riverside Care Home" />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="preview-note"
              className="text-xs font-bold tracking-wide text-muted-foreground uppercase"
            >
              Optional note
            </label>
            <Textarea
              id="preview-note"
              placeholder="e.g. Covering an extra hour for handover…"
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg">Table</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff</TableHead>
              <TableHead>Clocked in</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Jamie Morgan</TableCell>
              <TableCell>08:02</TableCell>
              <TableCell>2h 14m</TableCell>
              <TableCell>
                <Badge>On shift</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Priya Nair</TableCell>
              <TableCell>&ndash;</TableCell>
              <TableCell>&ndash;</TableCell>
              <TableCell>
                <Badge variant="secondary">Off shift</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
