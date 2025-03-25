import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";

const matchData = [
  {
    cricbuzzId: "114986",
    matchNumber: 1,
  },
  {
    cricbuzzId: "114985",
    matchNumber: 2,
  },
  {
    cricbuzzId: "114984",
    matchNumber: 3,
  },
  {
    cricbuzzId: "114983",
    matchNumber: 4,
  },
  {
    cricbuzzId: "114987",
    matchNumber: 5,
  },
  {
    cricbuzzId: "114996",
    matchNumber: 6,
  },
  {
    cricbuzzId: "115005",
    matchNumber: 7,
  },
  {
    cricbuzzId: "115012",
    matchNumber: 8,
  },
  {
    cricbuzzId: "115014",
    matchNumber: 9,
  },
  {
    cricbuzzId: "115021",
    matchNumber: 10,
  },
  {
    cricbuzzId: "115030",
    matchNumber: 11,
  },
  {
    cricbuzzId: "115032",
    matchNumber: 12,
  },
  {
    cricbuzzId: "115039",
    matchNumber: 13,
  },
  {
    cricbuzzId: "115048",
    matchNumber: 14,
  },
  {
    cricbuzzId: "115050",
    matchNumber: 15,
  },
  {
    cricbuzzId: "115059",
    matchNumber: 16,
  },
  {
    cricbuzzId: "115068",
    matchNumber: 17,
  },
  {
    cricbuzzId: "115075",
    matchNumber: 18,
  },
  {
    cricbuzzId: "115084",
    matchNumber: 19,
  },
  {
    cricbuzzId: "115093",
    matchNumber: 20,
  },
  {
    cricbuzzId: "115095",
    matchNumber: 21,
  },
  {
    cricbuzzId: "115102",
    matchNumber: 22,
  },
  {
    cricbuzzId: "115104",
    matchNumber: 23,
  },
  {
    cricbuzzId: "115111",
    matchNumber: 24,
  },
  {
    cricbuzzId: "115113",
    matchNumber: 25,
  },
  {
    cricbuzzId: "115122",
    matchNumber: 26,
  },
  {
    cricbuzzId: "115129",
    matchNumber: 27,
  },
  {
    cricbuzzId: "115138",
    matchNumber: 28,
  },
  {
    cricbuzzId: "115140",
    matchNumber: 29,
  },
  {
    cricbuzzId: "115149",
    matchNumber: 30,
  },
  {
    cricbuzzId: "115156",
    matchNumber: 31,
  },
  {
    cricbuzzId: "115165",
    matchNumber: 32,
  },
  {
    cricbuzzId: "115167",
    matchNumber: 33,
  },
  {
    cricbuzzId: "115174",
    matchNumber: 34,
  },
  {
    cricbuzzId: "115176",
    matchNumber: 35,
  },
  {
    cricbuzzId: "115183",
    matchNumber: 36,
  },
  {
    cricbuzzId: "115192",
    matchNumber: 37,
  },
  {
    cricbuzzId: "115201",
    matchNumber: 38,
  },
  {
    cricbuzzId: "115210",
    matchNumber: 39,
  },
  {
    cricbuzzId: "115212",
    matchNumber: 40,
  },
  {
    cricbuzzId: "115221",
    matchNumber: 41,
  },
  {
    cricbuzzId: "115230",
    matchNumber: 42,
  },
  {
    cricbuzzId: "115239",
    matchNumber: 43,
  },
  {
    cricbuzzId: "115248",
    matchNumber: 44,
  },
  {
    cricbuzzId: "115255",
    matchNumber: 45,
  },
  {
    cricbuzzId: "115257",
    matchNumber: 46,
  },
  {
    cricbuzzId: "115266",
    matchNumber: 47,
  },
  {
    cricbuzzId: "115275",
    matchNumber: 48,
  },
  {
    cricbuzzId: "115282",
    matchNumber: 49,
  },
  {
    cricbuzzId: "115291",
    matchNumber: 50,
  },
  {
    cricbuzzId: "115300",
    matchNumber: 51,
  },
  {
    cricbuzzId: "115302",
    matchNumber: 52,
  },
  {
    cricbuzzId: "115309",
    matchNumber: 53,
  },
  {
    cricbuzzId: "115318",
    matchNumber: 54,
  },
  {
    cricbuzzId: "115327",
    matchNumber: 55,
  },
  {
    cricbuzzId: "115336",
    matchNumber: 56,
  },
  {
    cricbuzzId: "115345",
    matchNumber: 57,
  },
  {
    cricbuzzId: "115347",
    matchNumber: 58,
  },
  {
    cricbuzzId: "115354",
    matchNumber: 59,
  },
  {
    cricbuzzId: "115356",
    matchNumber: 60,
  },
  {
    cricbuzzId: "115365",
    matchNumber: 61,
  },
  {
    cricbuzzId: "115372",
    matchNumber: 62,
  },
  {
    cricbuzzId: "115381",
    matchNumber: 63,
  },
  {
    cricbuzzId: "115390",
    matchNumber: 64,
  },
  {
    cricbuzzId: "115392",
    matchNumber: 65,
  },
  {
    cricbuzzId: "115401",
    matchNumber: 66,
  },
  {
    cricbuzzId: "115410",
    matchNumber: 67,
  },
  {
    cricbuzzId: "115417",
    matchNumber: 68,
  },
  {
    cricbuzzId: "115426",
    matchNumber: 69,
  },
  {
    cricbuzzId: "115435",
    matchNumber: 70,
  },
];

export const UpdateCricbuzz = () => {
  const updateCricbuzz = useMutation(api.admin.updateMultipleCricbuzzIds);

  const handleUpdate = async () => {
    await updateCricbuzz({ data: matchData });
    console.log("✅ Cricbuzz IDs updated.");
  };
  return <Button onClick={() => handleUpdate()}>Update Cricbuzz</Button>;
};
