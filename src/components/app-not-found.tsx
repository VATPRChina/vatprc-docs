import { Trans } from "@lingui/react/macro";
import { Container, Title, Button, Text, Stack } from "@mantine/core";
import { Link } from "@tanstack/react-router";

export const NotFound: React.FC = () => (
  <Container>
    <Stack gap="xl" align="start">
      <Title order={1} size={192} c="dimmed">
        404
      </Title>
      <Title order={2}>
        <Trans>Nothing to see here</Trans>
      </Title>
      <Text c="dimmed" size="lg">
        <Trans>
          Page you are trying to open does not exist. You may have mistyped the address, or the page has been moved to
          another URL.
        </Trans>
      </Text>
      <Button size="md" variant="light" renderRoot={(props) => <Link to="/" {...props} />}>
        <Trans>Take me back to home page</Trans>
      </Button>
    </Stack>
  </Container>
);
