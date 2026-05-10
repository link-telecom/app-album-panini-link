import Image from "next/image";

type Props = {
  size?: number;
};

export function Logo({ size = 120 }: Props) {
  return (
    <div
      className="bg-[#f8f5e6] rounded-2xl shadow-2xl flex items-center justify-center"
      style={{ padding: size * 0.08 }}
    >
      <Image
        src="/logo.jpeg"
        alt="Link Telecomunicaciones"
        width={size}
        height={size}
        priority
        className="block"
      />
    </div>
  );
}
