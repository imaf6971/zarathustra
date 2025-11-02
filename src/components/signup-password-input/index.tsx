import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";

export function SignUpPasswordInput({ isError }: { isError: boolean }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center">
        <Label className={cn(isError && "text-destructive")} htmlFor="password">
          Password
        </Label>
      </div>
      <InputGroup>
        <InputGroupInput
          aria-invalid={isError}
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
        />
        <InputGroupAddon align="inline-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                variant="ghost"
                aria-label="Info"
                size="icon-xs"
              >
                <InfoIcon />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>
              <p>Password must be at least 8 characters</p>
            </TooltipContent>
          </Tooltip>
        </InputGroupAddon>
      </InputGroup>
      {isError && (
        <div className="text-destructive text-sm">
          <div className="text-nowrap">
            Server’s having an existential crisis.
            <br />
            Please try again later
          </div>
        </div>
      )}
    </div>
  );
}
