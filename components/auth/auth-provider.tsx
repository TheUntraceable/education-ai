import { SessionProvider } from "next-auth/react";

type Props = {
    children: React.ReactNode;
};

export default function AuthProvider(props: Props) {
    const { children } = props;

    return <SessionProvider>{children}</SessionProvider>;
}
