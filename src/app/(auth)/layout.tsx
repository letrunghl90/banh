import styles from './auth.module.css';

// Bố cục màn đăng nhập theo mockup: bên trái giới thiệu, bên phải biểu mẫu.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-label="Giới thiệu Cùng Con Học">
        <div>
          <p className={styles.brand}>Cùng Con Học</p>
          <p className={styles.brandSub}>Đồng hành cùng con mỗi ngày</p>
        </div>
        <p className={styles.slogan}>
          Học đúng cách,
          <br />
          con tiến bộ mỗi ngày
        </p>
        <ul className={styles.features}>
          <li>Lịch học cố định</li>
          <li>Bài tập về nhà có hướng dẫn</li>
          <li>Theo dõi tiến độ học tập</li>
          <li>An toàn và bảo mật</li>
        </ul>
      </section>
      <main className={styles.panel}>
        <div className={styles.card}>{children}</div>
      </main>
    </div>
  );
}
