import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ExternalLink } from "lucide-react";
import Cookies from "js-cookie";

interface TrelloConfig {
  apiKey: string;
  token: string;
  boardId: string;
}

interface LinearConfig {
  apiKey: string;
  workspaceId: string;
}

interface AsanaConfig {
  personalAccessToken: string;
  projectId: string;
}

type PlatformConfig = TrelloConfig | LinearConfig | AsanaConfig;

interface ConfigurationFormProps {
  selectedTool: "trello" | "linear" | "asana" | "notion";
  onConfigSave: (config: PlatformConfig) => void;
  onCancel: () => void;
}

const ConfigurationForm: React.FC<ConfigurationFormProps> = ({
  selectedTool,
  onConfigSave,
  onCancel,
}) => {
  const [config, setConfig] = useState<PlatformConfig>(
    selectedTool === "trello"
      ? { apiKey: "", token: "", boardId: "" }
      : selectedTool === "linear"
      ? { apiKey: "", workspaceId: "" }
      : { personalAccessToken: "", projectId: "" }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTool === "trello") {
      const trelloConfig = config as TrelloConfig;
      if (trelloConfig.apiKey && trelloConfig.token && trelloConfig.boardId) {
        onConfigSave(trelloConfig);
        Cookies.set("apiKey", trelloConfig.apiKey, { expires: 365 * 50 });
        Cookies.set("token", trelloConfig.token, { expires: 365 * 50 });
        Cookies.set("boardId", trelloConfig.boardId, { expires: 365 * 50 });
        Cookies.set("platform", "trello", { expires: 365 * 50 });
      }
    } else if (selectedTool === "linear") {
      const linearConfig = config as LinearConfig;
      if (linearConfig.apiKey && linearConfig.workspaceId) {
        onConfigSave(linearConfig);
        localStorage.setItem('linear_config', JSON.stringify(linearConfig));
        Cookies.set("apiKey", linearConfig.apiKey, { expires: 365 * 50 });
        Cookies.set("workspaceId", linearConfig.workspaceId, { expires: 365 * 50 });
        Cookies.set("platform", "linear", { expires: 365 * 50 });
      }
    } else if (selectedTool === "asana") {
      const asanaConfig = config as AsanaConfig;
      if (asanaConfig.personalAccessToken && asanaConfig.projectId) {
        onConfigSave(asanaConfig);
        localStorage.setItem('asana_config', JSON.stringify(asanaConfig));
        Cookies.set("personalAccessToken", asanaConfig.personalAccessToken, { expires: 365 * 50 });
        Cookies.set("projectId", asanaConfig.projectId, { expires: 365 * 50 });
        Cookies.set("platform", "asana", { expires: 365 * 50 });
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    if (selectedTool === "trello") {
      const trelloConfig = config as TrelloConfig;
      return trelloConfig.apiKey && trelloConfig.token && trelloConfig.boardId;
    } else if (selectedTool === "linear") {
      const linearConfig = config as LinearConfig;
      return linearConfig.apiKey && linearConfig.workspaceId;
    } else if (selectedTool === "asana") {
      const asanaConfig = config as AsanaConfig;
      return asanaConfig.personalAccessToken && asanaConfig.projectId;
    }
    return false;
  };

  if (selectedTool === "notion") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Notion Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Notion integration coming soon...
          </p>
          <Button onClick={onCancel} variant="outline" className="w-full">
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">
          {selectedTool === "trello"
            ? "Trello"
            : selectedTool === "linear"
            ? "Linear"
            : selectedTool === "asana"
            ? "Asana"
            : ""} Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform-specific fields */}
          {selectedTool === "trello" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="apiKey">Trello API Key</Label>
                <Input
                  id="apiKey"
                  type="text"
                  value={(config as TrelloConfig).apiKey}
                  onChange={(e) => handleInputChange("apiKey", e.target.value)}
                  placeholder="Enter your Trello API Key"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="token">Trello Token</Label>
                <Input
                  id="token"
                  type="text"
                  value={(config as TrelloConfig).token}
                  onChange={(e) => handleInputChange("token", e.target.value)}
                  placeholder="Enter your Trello Token"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boardId">Board ID</Label>
                <Input
                  id="boardId"
                  type="text"
                  value={(config as TrelloConfig).boardId}
                  onChange={(e) => handleInputChange("boardId", e.target.value)}
                  placeholder="Enter your Trello Board ID"
                  required
                />
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Get your API key and token from{" "}
                  <a
                    href="https://trello.com/app-key"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    Trello App Key
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>
            </>
          ) : selectedTool === "linear" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="apiKey">Linear API Key</Label>
                <Input
                  id="apiKey"
                  type="text"
                  value={(config as LinearConfig).apiKey}
                  onChange={(e) => handleInputChange("apiKey", e.target.value)}
                  placeholder="Enter your Linear API Key"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspaceId">Workspace ID</Label>
                <Input
                  id="workspaceId"
                  type="text"
                  value={(config as LinearConfig).workspaceId}
                  onChange={(e) => handleInputChange("workspaceId", e.target.value)}
                  placeholder="Enter your Linear Workspace ID"
                  required
                />
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Get your API key from{" "}
                  <a
                    href="https://linear.app/settings/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    Linear API Settings
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>
            </>
          ) : selectedTool === "asana" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="personalAccessToken">Personal Access Token</Label>
                <Input
                  id="personalAccessToken"
                  type="password"
                  value={(config as AsanaConfig).personalAccessToken}
                  onChange={(e) => handleInputChange("personalAccessToken", e.target.value)}
                  placeholder="Enter your Asana Personal Access Token"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectId">Project ID</Label>
                <Input
                  id="projectId"
                  type="text"
                  value={(config as AsanaConfig).projectId}
                  onChange={(e) => handleInputChange("projectId", e.target.value)}
                  placeholder="Enter your Asana Project ID"
                  required
                />
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Get your personal access token from{" "}
                  <a
                    href="https://app.asana.com/0/my-apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    Asana My Apps
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>
            </>
          ) : null}

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={!isFormValid()}
            >
              Save Configuration
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ConfigurationForm; 