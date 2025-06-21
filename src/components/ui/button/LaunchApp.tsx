import styles from "./LaunchApp.module.css";
import { useRouter } from "next/navigation";

export default function LaunchAppButton() {
    const router = useRouter();
    return (
        <button className={styles.NavBarButton} onClick={() => router.push('/dashboard')}>Launch App</button>
    )
}