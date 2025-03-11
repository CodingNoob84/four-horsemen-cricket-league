"use client";

import { useMutation, useQuery } from "convex/react";
import { AlertTriangle, Home, Lock, RefreshCw, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";

import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

export const NoAccessCard = () => {
  const [requestStatus, setRequestStatus] = useState<
    "pending" | "approved" | "rejected" | null
  >(null);

  // Fetch user's admin request status
  const request = useQuery(api.adminreq.fetchUserAdminRequestStatus);

  useEffect(() => {
    if (request) {
      setRequestStatus(request.status);
    }
  }, [request]);

  // Mutation to send admin access request
  const sendRequest = useMutation(api.adminreq.sendAdminRequest);

  const handleRequest = async () => {
    try {
      const result = await sendRequest();
      if (result.success) {
        toast.success("Request sent Successfully");
      } else {
        toast.error("Error sending request");
      }
      setRequestStatus("pending");
    } catch (error) {
      toast.error("Error sending request");
      console.error("Error sending request:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-md mx-auto py-8">
      <Card className="w-full">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-red-100 p-3 rounded-full mb-2">
            <Lock className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Admin Access Required</CardTitle>
          <CardDescription>
            You don&apos;t have permission to access this area.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center pt-4">
          <Image
            src="/no-access.png"
            alt="Access Denied"
            width={300}
            height={200}
            className="rounded-lg mb-6 border"
          />

          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 w-full mb-4 flex items-start">
            <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Admin privileges are required</p>
              <p className="text-sm mt-1">
                This section is restricted to administrators only. If you need
                access, please submit a request or return to the homepage.
              </p>
            </div>
          </div>

          {/* Show status messages */}
          {requestStatus === "pending" && (
            <div className="text-sm text-orange-600 font-semibold">
              Your request is pending approval ⏳
            </div>
          )}
          {requestStatus === "approved" && (
            <div className="text-sm text-green-600 font-semibold">
              Your request has been approved ✅
            </div>
          )}
          {requestStatus === "rejected" && (
            <div className="text-sm text-red-600 font-semibold">
              Your request was rejected ❌
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-5">
          {requestStatus === "pending" ? (
            <Button disabled className="flex-1 bg-gray-400">
              <Send className="h-4 w-4 mr-2" />
              Request Sent
            </Button>
          ) : requestStatus === "rejected" ? (
            <Button
              variant="default"
              className="flex-1"
              onClick={handleRequest}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Send Request Again
            </Button>
          ) : requestStatus === "approved" ? (
            <Button variant="default" className="flex-1" asChild>
              <Link href="/">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button
              variant="default"
              className="flex-1"
              onClick={handleRequest}
            >
              <Send className="h-4 w-4 mr-2" />
              Request Admin Access
            </Button>
          )}

          <Button variant="outline" className="flex-1" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
