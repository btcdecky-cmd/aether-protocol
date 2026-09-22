//! Aether lending market (sketch)
//! Unlocks only after user has received ≥1 campaign payout (journey step 6).

use anchor_lang::prelude::*;

declare_id!("AethrLend111111111111111111111111111111111");

#[program]
pub mod aether_lending {
    use super::*;

    pub fn init_market(ctx: Context<InitMarket>, ltv_bps: u16) -> Result<()> {
        let m = &mut ctx.accounts.market;
        m.authority = ctx.accounts.authority.key();
        m.ltv_bps = ltv_bps;
        m.total_deposits = 0;
        m.total_borrows = 0;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(
            ctx.accounts.user_adoption.payouts_received > 0,
            LendError::AdoptionGate
        );
        let m = &mut ctx.accounts.market;
        m.total_deposits = m.total_deposits.saturating_add(amount);
        Ok(())
    }
}

#[account]
pub struct Market {
    pub authority: Pubkey,
    pub ltv_bps: u16,
    pub total_deposits: u64,
    pub total_borrows: u64,
}

#[account]
pub struct UserAdoption {
    pub user: Pubkey,
    pub payouts_received: u32,
    pub journey_step: u8,
}

#[derive(Accounts)]
pub struct InitMarket<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(init, payer = authority, space = 8 + 32 + 2 + 8 + 8)]
    pub market: Account<'info, Market>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    pub user: Signer<'info>,
    #[account(mut)]
    pub market: Account<'info, Market>,
    pub user_adoption: Account<'info, UserAdoption>,
}

#[error_code]
pub enum LendError {
    #[msg("Complete a paid campaign action before using lending")]
    AdoptionGate,
}
