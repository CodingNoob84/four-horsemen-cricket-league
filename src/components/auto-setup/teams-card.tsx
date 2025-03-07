"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Team } from "@/types";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useMutation } from "convex/react";
import { Loader } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export default function TeamsCard({
  initTeams,
  handleCardSelection,
}: {
  initTeams: Team[];
  handleCardSelection: (option: "intro") => void;
}) {
  console.log("init", initTeams);
  const [orderedTeams, setOrderedTeams] = useState<Team[]>(initTeams);
  const [submitting, setSubmitting] = useState(false);
  const updateTeamsSetup = useMutation(api.teams.updateTeamsSetup);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(orderedTeams);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedTeams(items);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const data: Id<"teams">[] = orderedTeams.map((team) => team._id);
      await updateTeamsSetup({ orderedTeams: data });
      console.log("data", data);
      handleCardSelection("intro");
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg animate-fade-in">
      <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
        <CardTitle className="text-2xl font-bold">
          Rank Your Favorite IPL Teams
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-center mb-6">
          Drag and drop to arrange teams in your preferred order
        </p>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="teams">
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {orderedTeams.map((team, index) => (
                  <Draggable
                    key={team._id}
                    draggableId={team._id}
                    index={index}
                  >
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-white rounded-lg shadow p-3 flex items-center gap-4 border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex-shrink-0 w-12 h-12 relative">
                          <Image
                            src={team.image || "/placeholder.svg"}
                            alt={`${team.shortForm} logo`}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="font-medium">
                          {index + 1}. {team.teamName}
                        </span>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
      <CardFooter className="flex justify-center p-6">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-2 rounded-full transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {submitting ? <Loader className="animate-spin w-4 h-4" /> : null}
          {submitting ? "Submitting..." : "Submit"}
        </Button>
      </CardFooter>
    </Card>
  );
}
