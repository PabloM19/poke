import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function UiDemo() {
  const [switchOn, setSwitchOn] = useState(false)

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold text-foreground">Demo shadcn/ui</h1>
      <p className="text-muted-foreground">
        Verificación visual de los componentes instalados (estética neutra).
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">Button</h2>
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">Card</h2>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Título de tarjeta</CardTitle>
            <CardDescription>Descripción breve de la tarjeta.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Contenido de ejemplo. Sin diseño Pokémon, solo neutro.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">
              Acción
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">Badge</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">Input</h2>
        <Input placeholder="Escribe aquí..." className="max-w-xs" />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">Sheet</h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Abrir Sheet</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Título del panel</SheetTitle>
              <SheetDescription>
                Panel lateral. Cierra con el botón o tocando fuera.
              </SheetDescription>
            </SheetHeader>
            <p className="py-4 text-sm text-muted-foreground">
              Contenido del sheet.
            </p>
          </SheetContent>
        </Sheet>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">Tabs</h2>
        <Tabs defaultValue="tab1" className="w-full max-w-md">
          <TabsList>
            <TabsTrigger value="tab1">Uno</TabsTrigger>
            <TabsTrigger value="tab2">Dos</TabsTrigger>
            <TabsTrigger value="tab3">Tres</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Contenido de la pestaña 1.</TabsContent>
          <TabsContent value="tab2">Contenido de la pestaña 2.</TabsContent>
          <TabsContent value="tab3">Contenido de la pestaña 3.</TabsContent>
        </Tabs>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">Accordion</h2>
        <Accordion type="single" collapsible className="w-full max-w-md">
          <AccordionItem value="a1">
            <AccordionTrigger>Sección 1</AccordionTrigger>
            <AccordionContent>
              Contenido colapsable de la sección 1.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="a2">
            <AccordionTrigger>Sección 2</AccordionTrigger>
            <AccordionContent>
              Contenido colapsable de la sección 2.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">Switch</h2>
        <div className="flex items-center gap-2">
          <Switch
            checked={switchOn}
            onCheckedChange={setSwitchOn}
          />
          <span className="text-sm text-muted-foreground">
            {switchOn ? 'Activado' : 'Desactivado'}
          </span>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">Dialog</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Abrir Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Título del diálogo</DialogTitle>
              <DialogDescription>
                Diálogo modal. Cierra con la X o tocando fuera.
              </DialogDescription>
            </DialogHeader>
            <p className="py-2 text-sm text-muted-foreground">
              Contenido del diálogo.
            </p>
            <DialogFooter showCloseButton>
              <Button>Aceptar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  )
}
