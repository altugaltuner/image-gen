import Hero from "@/components/hero";

export default async function Index() {
  return (
    <>
      <Hero />
      <main className="flex-1 flex flex-col gap-6 px-4 items-center">
        <h2 className="font-medium text-xl mb-4">Go to signup page and start to create images.</h2>
      </main>
    </>
  );
}
