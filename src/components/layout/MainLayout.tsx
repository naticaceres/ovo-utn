import React from 'react';
import { GlobalHeader } from './GlobalHeader';
import { GlobalFooter } from './GlobalFooter';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
  headerContent?: React.ReactNode; // Para navegación personalizada
  className?: string;
}

export function MainLayout({
  children,
  headerContent,
  className,
}: MainLayoutProps) {
  return (
    <div className={`${styles.mainLayout} ${className || ''}`}>
      <GlobalHeader>{headerContent}</GlobalHeader>

      <main className={styles.main}>
        <div className={styles.container}>{children}</div>
      </main>

      <GlobalFooter />
    </div>
  );
}
