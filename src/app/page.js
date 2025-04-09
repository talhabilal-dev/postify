"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <section className="relative w-full h-screen ">
      <Navbar />

      <div className="relative flex flex-col justify-center items-center h-full">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-50">
          Welcome to Postify
        </h1>
        <div className="flex justify-center items-center mt-4">
          <Button asChild>
            <Link href="/user/sign-up" className="text-white w-24">
              Get Started
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
