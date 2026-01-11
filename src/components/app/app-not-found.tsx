import { LinkButton } from "../ui/link-button";
import { Trans } from "@lingui/react/macro";
import { Container, Title, Text, Stack } from "@mantine/core";

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
      <LinkButton size="md" variant="light" to="/">
        <Trans>Take me back to home page</Trans>
      </LinkButton>
    </Stack>
  </Container>
);
