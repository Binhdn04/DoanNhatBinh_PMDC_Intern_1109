import { AuthController, CoreController } from "../src/modules/controllers";

const principal = {
  id: "user-1",
  role: "STUDENT",
  sid: "session-1",
  version: 1,
} as any;

describe("controllers", () => {
  it("delegates every auth action with its body, principal, and request", async () => {
    const auth = {
      signIn: jest.fn().mockResolvedValue("signed-in"),
      signOut: jest.fn().mockResolvedValue("signed-out"),
      requestPasswordReset: jest.fn().mockResolvedValue("requested"),
      resetPassword: jest.fn().mockResolvedValue("reset"),
    };
    const controller = new AuthController(auth as any);
    const request = { ip: "127.0.0.1" };
    const signIn = {
      email: "user@example.test",
      password: "Password123!",
    } as any;
    const resetRequest = { email: "user@example.test" } as any;
    const reset = { token: "a".repeat(32), password: "Password123!" } as any;

    await expect(controller.signIn(signIn, request)).resolves.toBe("signed-in");
    await expect(controller.signOut(principal)).resolves.toBe("signed-out");
    await expect(
      controller.requestPasswordReset(resetRequest, request),
    ).resolves.toBe("requested");
    await expect(controller.resetPassword(reset)).resolves.toBe("reset");
    expect(auth.signIn).toHaveBeenCalledWith(signIn, request);
    expect(auth.signOut).toHaveBeenCalledWith(principal);
    expect(auth.requestPasswordReset).toHaveBeenCalledWith(
      resetRequest,
      request,
    );
    expect(auth.resetPassword).toHaveBeenCalledWith(reset);
  });

  it("delegates core endpoints and supplies a default postings query", async () => {
    const identity = {
      healthcheck: jest.fn().mockReturnValue("healthy"),
      me: jest.fn().mockReturnValue("me"),
      setRole: jest.fn().mockReturnValue("role"),
    };
    const profiles = {
      profile: jest.fn().mockReturnValue("profile"),
      updateProfile: jest.fn().mockReturnValue("updated"),
      getSkills: jest.fn().mockReturnValue("skills"),
      setSkills: jest.fn().mockReturnValue("skills-set"),
      getPreferences: jest.fn().mockReturnValue("preferences"),
      setPreferences: jest.fn().mockReturnValue("preferences-set"),
    };
    const postings = {
      postingsList: jest.fn().mockReturnValue("postings"),
      listCompanies: jest.fn().mockReturnValue("companies"),
      company: jest.fn().mockReturnValue("company"),
      getPosting: jest.fn().mockReturnValue("posting"),
      createPosting: jest.fn().mockReturnValue("created"),
      savePosting: jest.fn().mockReturnValue("saved"),
    };
    const applications = {
      apply: jest.fn().mockReturnValue("applied"),
      applications: jest.fn().mockReturnValue("applications"),
      application: jest.fn().mockReturnValue("application"),
      accept: jest.fn().mockReturnValue("accepted"),
      withdraw: jest.fn().mockReturnValue("withdrawn"),
    };
    const controller = new CoreController(
      identity as any,
      profiles as any,
      postings as any,
      applications as any,
    );
    const body = { value: true } as any;

    expect(controller.healthcheck()).toBe("healthy");
    expect(controller.me(principal)).toBe("me");
    expect(await controller.setRole(principal, body)).toBe("role");
    expect(await controller.profile(principal)).toBe("profile");
    expect(await controller.updateProfile(principal, body)).toBe("updated");
    expect(await controller.getSkills(principal)).toBe("skills");
    expect(await controller.setSkills(principal, body)).toBe("skills-set");
    expect(await controller.getPreferences(principal)).toBe("preferences");
    expect(await controller.setPreferences(principal, body)).toBe(
      "preferences-set",
    );
    expect(await controller.postingsList(principal)).toBe("postings");
    expect(await controller.listCompanies()).toBe("companies");
    expect(await controller.company("company-1")).toBe("company");
    expect(await controller.getPosting(principal, "posting-1")).toBe("posting");
    expect(await controller.createPosting(principal, body)).toBe("created");
    expect(await controller.savePosting(principal, "posting-1")).toBe("saved");
    expect(await controller.apply(principal, body)).toBe("applied");
    expect(await controller.applications(principal, body)).toBe("applications");
    expect(await controller.application(principal, "application-1")).toBe(
      "application",
    );
    expect(await controller.accept(principal, "application-1", body)).toBe(
      "accepted",
    );
    expect(controller.withdraw(principal, "application-1")).toBe("withdrawn");
    expect(identity.healthcheck).toHaveBeenCalledWith();
    expect(identity.me).toHaveBeenCalledWith(principal);
    expect(identity.setRole).toHaveBeenCalledWith(principal, body);
    expect(profiles.profile).toHaveBeenCalledWith(principal);
    expect(profiles.updateProfile).toHaveBeenCalledWith(principal, body);
    expect(profiles.getSkills).toHaveBeenCalledWith(principal);
    expect(profiles.setSkills).toHaveBeenCalledWith(principal, body);
    expect(profiles.getPreferences).toHaveBeenCalledWith(principal);
    expect(profiles.setPreferences).toHaveBeenCalledWith(principal, body);
    expect(postings.postingsList).toHaveBeenCalledWith(
      principal,
      expect.objectContaining({ page: 1, pageSize: 20 }),
    );
    expect(postings.listCompanies).toHaveBeenCalledWith();
    expect(postings.company).toHaveBeenCalledWith("company-1");
    expect(postings.getPosting).toHaveBeenCalledWith(principal, "posting-1");
    expect(postings.createPosting).toHaveBeenCalledWith(principal, body);
    expect(postings.savePosting).toHaveBeenCalledWith(principal, "posting-1");
    expect(applications.apply).toHaveBeenCalledWith(principal, body);
    expect(applications.applications).toHaveBeenCalledWith(principal, body);
    expect(applications.application).toHaveBeenCalledWith(
      principal,
      "application-1",
    );
    expect(applications.accept).toHaveBeenCalledWith(
      principal,
      "application-1",
      body,
    );
    expect(applications.withdraw).toHaveBeenCalledWith(
      principal,
      "application-1",
    );
  });
});
