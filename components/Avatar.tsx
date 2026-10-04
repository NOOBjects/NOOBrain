import { Mascot } from "./Mascot";

/** O mascote sobre uma das 6 cores da marca (cores em `.av0` a `.av5` no CSS). */
export function Avatar({ n, size = 56 }: { n: number; size?: number }) {
  return (
    <span className={`avatar av${n} ch`} style={{ width: size, height: size }} aria-hidden="true">
      <Mascot />
    </span>
  );
}
