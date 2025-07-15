'use client';

import { Container, Title, Space } from '@mantine/core';
import { CategoryList } from '@/components/category';

export default function CategoriesPage() {
  return (
    <Container size="md" py="xl">
      <Title order={1} mb="lg">
        Manage Categories
      </Title>
      
      <CategoryList />
    </Container>
  );
}