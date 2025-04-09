"use client";

import React, { useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CardHeader, CardContent, Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useParams } from "next/navigation";

const specialChar = "||";

const parseStringMessages = (messageString) => {
  return messageString.split(specialChar);
};

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function SendMessage() {
  const { toast } = useToast();
  const params = useParams();
  const username = params.username;

  const [completion, setCompletion] = useState(initialMessageString);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [error, setError] = useState(null);

  const messageRef = useRef(null);

  const handleMessageClick = (message) => {
    if (messageRef.current) {
      messageRef.current.value = message;
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const messageContent = messageRef.current?.value;

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageContent, username: "jhon123" }),
      });

      console.log(response)

      if (response.ok) {
        toast({
          title: "Message sent successfully",
          description: "Your message has been sent.",
        });
        if (messageRef.current) {
          messageRef.current.value = "";
        }
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error sending message:", err);
      toast({
        title: "Error",
        description: "An error occurred while sending the message.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async () => {
    setIsSuggestLoading(true);
    try {
      const response = await fetch("/api/messages/suggest-messages", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      console.log(data);

      setCompletion(data.data || initialMessageString);
      toast({
        title: "Success",
        description: "Suggested messages fetched successfully.",
      });
    } catch (err) {
      console.error("Error fetching messages:", err);
      toast({
        title: "Error",
        description: "Failed to fetch suggested messages.",
        variant: "destructive",
      });
      setError(err);
    } finally {
      setIsSuggestLoading(false);
    }
  };

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            Send Anonymous Message to @{username}
          </label>
          <Textarea
            id="content"
            placeholder="Write your anonymous message here"
            className="resize-none"
            ref={messageRef}
          />
        </div>
        <div className="flex justify-center">
          {isLoading ? (
            <Button >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isLoading || !messageRef.current?.value}
            >
              Send It
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-4 my-8">
        <div className="space-y-2">
          <Button
            onClick={fetchSuggestedMessages}
            className="my-4"
            disabled={isSuggestLoading}
          >
            Suggest Messages
          </Button>
          <p>Click on any message below to select it.</p>
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {error ? (
              <p className="text-red-500">{error.message}</p>
            ) : (
              parseStringMessages(completion).map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="mb-2"
                  onClick={() => handleMessageClick(message)}
                >
                  {message}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <Separator className="my-6" />
      <div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href={"/sign-up"}>
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}
