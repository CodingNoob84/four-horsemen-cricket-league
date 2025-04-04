"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, Check, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";

export const BothBet = () => {
  const [cskAmount, setCskAmount] = useState("");
  const [miAmount, setMiAmount] = useState("");
  const [remainingCoins, setRemainingCoins] = useState(4568);
  const [betPlaced, setBetPlaced] = useState(false);

  const [error, setError] = useState("");

  const handlePlaceBet = () => {
    // Validate inputs
    if (!cskAmount || !miAmount) {
      setError("Please enter bet amounts for both teams");
      return;
    }

    const cskValue = Number.parseInt(cskAmount);
    const miValue = Number.parseInt(miAmount);

    if (cskValue < 100 || miValue < 100) {
      setError("Minimum bet is ₹100 per team");
      return;
    }

    if (cskValue + miValue > remainingCoins) {
      setError("Insufficient coins");
      return;
    }

    // Place bet
    setRemainingCoins(remainingCoins - (cskValue + miValue));
    setBetPlaced(true);
    setError("");
  };

  const handleEdit = () => {
    setBetPlaced(false);
  };

  const handleDelete = () => {
    // Refund coins
    setRemainingCoins(
      remainingCoins + Number.parseInt(cskAmount) + Number.parseInt(miAmount)
    );
    setCskAmount("");
    setMiAmount("");
    setBetPlaced(false);
    setError("");
  };

  return (
    <Card className="">
      <CardHeader className="flex flex-row justify-between items-center tracking-tight bg-gradient-to-r from-sky-50 to-indigo-50 py-4">
        <CardTitle className="text-slate-800">Place Your Bets</CardTitle>
        <div className="text-sm flex justify-end items-end italic text-slate-500">
          *minimum 100 coins per team
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {betPlaced ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">
                Bet successfully placed!
              </AlertDescription>
            </Alert>

            <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-slate-700">CSK</span>
                <span className="text-slate-900 font-semibold">
                  ₹{cskAmount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-700">MI</span>
                <span className="text-slate-900 font-semibold">
                  ₹{miAmount}
                </span>
              </div>
            </div>

            <div className="flex justify-end text-sm text-slate-500">
              Remaining Coins: ₹{remainingCoins}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <Alert
                variant="destructive"
                className="bg-red-50 border-red-200 text-red-800"
              >
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                CSK Bet Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500">
                  ₹
                </span>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  className="pl-7 border-slate-200 focus:border-sky-200 focus:ring-sky-100"
                  value={cskAmount}
                  onChange={(e) => setCskAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                MI Bet Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500">
                  ₹
                </span>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  className="pl-7 border-slate-200 focus:border-sky-200 focus:ring-sky-100"
                  value={miAmount}
                  onChange={(e) => setMiAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end text-sm text-slate-500">
              Remaining Coins: ₹{remainingCoins}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 bg-slate-50">
        {betPlaced ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="text-slate-600 border-slate-200 hover:bg-slate-100"
            >
              <Edit2 className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-500 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => {
                setCskAmount("");
                setMiAmount("");
                setError("");
              }}
              className="text-slate-600 border-slate-200 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePlaceBet}
              className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600"
            >
              Place Bet
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};
