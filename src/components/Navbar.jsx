"use client";
import { Button } from "./ui/button";
import Link from "next/link";
export default function Navbar() {
  return (
    <nav className="bg-slate-300 dark:bg-slate-900 p-4 text-white flex justify-between items-center">
      <div className="text-xl font-bold  dark:text-slate-50 text-slate-900">
        Postify
      </div>

      <div className="text-3xl font-bold dark:text-slate-50 text-slate-900">
        Welcome to Postify
      </div>
      <div className="space-x-4">
        <Button asChild className="p-2 w-16">
          <Link href="/user/sign-in">Login</Link>
        </Button>
      </div>
    </nav>
  );
}
