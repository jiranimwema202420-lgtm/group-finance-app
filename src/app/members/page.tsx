import MembersClientOnly from "@/components/MembersClientOnly";
import SeedLocalMembersClientOnly from "@/components/SeedLocalMembersClientOnly";

export default function MembersPage() {
  return (
    <div className="space-y-4">
      <SeedLocalMembersClientOnly />
      <MembersClientOnly />
    </div>
  );
}
