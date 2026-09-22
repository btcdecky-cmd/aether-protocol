//! Aether campaign escrow (Anchor-style sketch)
//! Funds advertiser budget; releases per verified completion.

use anchor_lang::prelude::*;

declare_id!("AethrCmpEscrow11111111111111111111111111111");

#[program]
pub mod campaign_escrow {
    use super::*;

    pub fn initialize_campaign(
        ctx: Context<InitializeCampaign>,
        budget_lamports: u64,
        reward_per_completion: u64,
        max_completions: u32,
    ) -> Result<()> {
        let c = &mut ctx.accounts.campaign;
        c.advertiser = ctx.accounts.advertiser.key();
        c.budget_lamports = budget_lamports;
        c.spent_lamports = 0;
        c.reward_per_completion = reward_per_completion;
        c.max_completions = max_completions;
        c.completion_count = 0;
        c.status = CampaignStatus::Active as u8;
        Ok(())
    }

    pub fn pay_completion(ctx: Context<PayCompletion>) -> Result<()> {
        let c = &mut ctx.accounts.campaign;
        require!(c.status == CampaignStatus::Active as u8, EscrowError::NotActive);
        require!(
            c.completion_count < c.max_completions,
            EscrowError::MaxCompletions
        );
        require!(
            c.spent_lamports + c.reward_per_completion <= c.budget_lamports,
            EscrowError::BudgetExhausted
        );

        **ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? -=
            c.reward_per_completion;
        **ctx.accounts.participant.to_account_info().try_borrow_mut_lamports()? +=
            c.reward_per_completion;

        c.spent_lamports += c.reward_per_completion;
        c.completion_count += 1;
        Ok(())
    }

    pub fn pause(ctx: Context<AdminCampaign>) -> Result<()> {
        ctx.accounts.campaign.status = CampaignStatus::Paused as u8;
        Ok(())
    }

    pub fn end_and_refund(ctx: Context<AdminCampaign>) -> Result<()> {
        let c = &mut ctx.accounts.campaign;
        let remaining = c.budget_lamports.saturating_sub(c.spent_lamports);
        if remaining > 0 {
            **ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? -= remaining;
            **ctx.accounts.advertiser.to_account_info().try_borrow_mut_lamports()? += remaining;
        }
        c.status = CampaignStatus::Ended as u8;
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum CampaignStatus {
    Draft = 0,
    PendingReview = 1,
    Active = 2,
    Paused = 3,
    Ended = 4,
}

#[account]
pub struct CampaignAccount {
    pub advertiser: Pubkey,
    pub budget_lamports: u64,
    pub spent_lamports: u64,
    pub reward_per_completion: u64,
    pub max_completions: u32,
    pub completion_count: u32,
    pub status: u8,
}

#[derive(Accounts)]
pub struct InitializeCampaign<'info> {
    #[account(mut)]
    pub advertiser: Signer<'info>,
    #[account(init, payer = advertiser, space = 8 + 32 + 8 + 8 + 8 + 4 + 4 + 1)]
    pub campaign: Account<'info, CampaignAccount>,
    /// CHECK: escrow PDA holds lamports
    #[account(mut)]
    pub escrow: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PayCompletion<'info> {
    pub authority: Signer<'info>,
    #[account(mut)]
    pub campaign: Account<'info, CampaignAccount>,
    /// CHECK: escrow
    #[account(mut)]
    pub escrow: AccountInfo<'info>,
    /// CHECK: participant receives reward
    #[account(mut)]
    pub participant: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct AdminCampaign<'info> {
    pub advertiser: Signer<'info>,
    #[account(mut, has_one = advertiser)]
    pub campaign: Account<'info, CampaignAccount>,
    /// CHECK: escrow
    #[account(mut)]
    pub escrow: AccountInfo<'info>,
}

#[error_code]
pub enum EscrowError {
    #[msg("Campaign is not active")]
    NotActive,
    #[msg("Max completions reached")]
    MaxCompletions,
    #[msg("Budget exhausted")]
    BudgetExhausted,
}
